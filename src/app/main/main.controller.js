(function () {
  'use strict';

  angular
  .module('gifseina')
  .controller('MainController', MainController);

  /** @ngInject */
  function MainController($q, $scope, $http, ALBUM, Imagestore, $state, $filter, $firebaseArray, $timeout, dropState) {
    var vm = this;
    vm.ref = new Firebase('http://sweltering-fire-8163.firebaseIO.com/images');
    // vm.images = $firebaseArray(vm.ref.limitToLast(4));
    vm.images = $firebaseArray(vm.ref);

    vm._album = ALBUM;
    vm._api_url = 'https://api.imgur.com/3';

    // vm.album = Imagestore;

    vm.dropState = dropState;
    vm.service = $http;
    vm.$scope = $scope;
    vm.$state = $state;
    vm.$filter = $filter;
    vm.$timeout = $timeout;
    vm.$q = $q;
    vm.childVisible = false;
    vm.showTools = false;

    vm.importVisible = false;
    vm.importString = '';
    vm.defaultImportType = {type: 'Write something', value: null};
    vm.importType = {name: 'Write something', value: null};


    vm.inputFocused = false;
    document.addEventListener('keydown', function (evt) {
      vm.importVisible = true;
      vm.$timeout(function(){});

      var letter = String.fromCharCode(evt.keyCode);
      if (!vm.inputFocused && letter !== ''){
        vm.importString += letter.toLowerCase();
      }


      vm.$timeout(function(){
        vm.inputFocused = true;
        document.getElementById('import-input').focus();
      }, 400);
    });

    document.addEventListener('keyup', function (evt) {
      if (evt.keyCode === 13 && vm.importString){
        vm.importDone();
      }

      var type = vm.recognizeString(vm.importString);
      if (type.type){
        vm.importType = type;
      } else {
        vm.importType = angular.extend({}, vm.defaultImportType);
      }

      vm.$timeout(function(){});
    });

    vm.$scope.$on('$stateChangeStart', function (f,to) {
      vm.childVisible = to.name === 'root.image';
    });
  }


  MainController.prototype.recognizeString = function (string) {
    var type, value;
    var image = _.first(string.match(/https?:\/\/.*?\.(?:png|jpg|gif|jpeg|gifv|webm)/i));
    if (image){
      type = 'image/url';
      value = image;
    } else if (/^[ a-zA-Z0-9\,\.\;\:]{3,}$/.test(string)){
      type = 'tag';
      value = _.map(string.split(/[\,\.\;\:]/), function (tag) { return tag.trim(); });
    }

    return {
      type: type,
      value: value
    }
  };


  /**
   * import string has been set (on blur and keycode 13)
   * start importing process
   * @return {[type]} [description]
   */
  MainController.prototype.importDone = function () {
    var vm = this;
    vm.importVisible = false;
    var stringData = vm.recognizeString( vm.importString.trim() );
    vm.importString = '';

    if (stringData.type === 'image/url') {
      vm.importImageFromUrl(stringData.value);
    }

    vm.importType = angular.extend({}, vm.defaultImportType);
    vm.inputFocused = false;
  };

  /**
   * import an image from imgur
   * @param  {string} imageId imgur image id
   * @return {promise}
   */
  MainController.prototype.importImageFromImgur = function (imageId) {
    var vm = this;
    vm.service.get(vm._api_url+'/image/'+imageId).then(function (response) {
      vm.addImage(response.data.data);
    });
  };

  /**
   * import any image from url
   * @param  {string} url
   * @return {promise}
   */
  MainController.prototype.importImageFromUrl = function (url) {
    var vm = this;
    var imageId = vm.$filter('imageId')(url);

    if (imageId){
      return vm.importImageFromImgur(imageId);
    } else {
      return vm.service.post(vm._api_url+'/image', {
        image :url,
        type: 'URL',
        album: vm._album.hash
      }).then(function (response) {
        if (response.data.status === 200){
          vm.addImage(response.data.data);
        }
      });
    }
  };

  /**
   * dropinput action
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  MainController.prototype.importFile = function (data) {
    var vm = this;
    if (data.type === 'idlist'){
      // TODO: Heikki tarkasta toimiiko tämä...
      _.map(data.data, vm.importImageFromUrl, vm);
    } else if (data.data && data.type) {
      vm.upload(data);
    }
  };

  MainController.prototype.imageDragStart = function (image) {
    var vm = this;
    vm.showTools = true;
    vm.dropState.disabled = true;
    vm.dragImage = image;
    vm.$timeout(function () {});
  };

  MainController.prototype.imageDragEnd = function (image) {
    var vm = this;

    vm.dropState.disabled = false;
    vm.showTools = false;
    vm.dragImage = null;
    vm.$timeout(function () {});
  };


  MainController.prototype.getAlbum = function () {
    var vm = this;
    return vm.service.get(vm._api_url+'/album/'+vm._album.id).then(function (response) {
      response.data.data.images.forEach(function (image) {
        vm.addImage(image);
      });

      return response.data;
    });
  };


  /**
   * delete image from firebase and imgur
   * @param  {[type]} image [description]
   * @return {[type]}       [description]
   */
  MainController.prototype.removeImage = function (image) {
    var vm = this;

    if (image.deletehash){
      vm.deleteImgurImage(image).then(function(){
        vm.images.$remove(image);
      });

    } else {
      vm.images.$remove(image);
    }
  };

  /**
   * delete images from imgur
   * @param  {array} idlist list of ids to remove
   * @return {[type]}        [description]
   */
  MainController.prototype.deleteFromImgur = function (idlist) {
    var vm = this;
    if (!_.isArray(idlist)){
      idlist = [idlist];
    }

    return vm.service.delete(vm._api_url+'album/'+vm._album.hash+'/remove_images', {
      params: {
        ids: idlist
      }
    });
  };

  /**
   * delete image from imgur server
   * @param  {[type]} image [description]
   * @return {[type]}       [description]
   */
  MainController.prototype.deleteImgurImage = function (image) {
    var vm = this;
    return vm.service.delete(vm._api_url+'/image/'+image.deletehash).then(function (response) {
      return response.data.data;
    });
  };

  /**
   * add new image
   * @param {[type]} image [description]
   */
  MainController.prototype.addImage = function (image) {
    var vm = this;
    if (!image){
      return;
    }

    if (_.isArray(image)){
      _.forEach(image, function (img) {
        vm.addImage(img);
      })
    } else {
      image.added = Date.now();
      vm.images.$add(image);
    }
  };

  /**
   * upload image data to imgur
   * @param  {[type]} image [description]
   * @return {[type]}       [description]
   */
  MainController.prototype.upload = function (image) {
    var vm = this;

    return vm.service.post(vm._api_url+'/image', {
      album: vm._album.hash,
      image: image.data,
      type: image.type
    }).then(function (response) {
      if (response.data.status === 200){
        vm.addImage(response.data.data);
      }
    });
  };

})();
