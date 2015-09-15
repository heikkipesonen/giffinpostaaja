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
    vm.importString = null;


    document.addEventListener('keydown', function (evt) {
      vm.importVisible = true;
      vm.$timeout(function(){});
      vm.$timeout(function(){
        document.getElementById('import-input').focus();
      }, 400);
    });

    document.addEventListener('keyup', function (evt) {
      if (evt.keyCode === 13 && vm.importString){
        vm.importDone();
      }
    })

    vm.$scope.$on('$stateChangeStart', function (f,to) {
      vm.childVisible = to.name === 'root.image';
    });
  }


  /**
   * import string has been set (on blur and keycode 13)
   * start importing process
   * @return {[type]} [description]
   */
  MainController.prototype.importDone = function () {
    var vm = this;

    vm.importVisible = false;

    var imageId = vm.$filter('imageId')(vm.importString);

    if (imageId){
      vm.importImageFromImgur(imageId);
      vm.importString = '';
    }
    vm.$timeout(function(){});
  };

  /**
   * import an image from imgur
   * @param  {string} imageId imgur image id
   * @return {promise}
   */
  MainController.prototype.importImageFromImgur = function (imageId) {
    var vm = this;
    vm.service.get('https://api.imgur.com/3/image/'+imageId).then(function (response) {
      vm.addImage(response.data.data);
    });
  };


  /**
   * check whether an image link is an imgur link
   * @param  {string}  url
   * @return {Boolean}
   */
  MainController.prototype.isImgurLink = function (url){
    var vm = this;
    return vm.$filter('imageId')(url);
  };


  /**
   * import any image from url
   * @param  {string} url
   * @return {promise}
   */
  MainController.prototype.importImageFromUrl = function (url) {
    var vm = this;
    var imageId = vm.isImgurLink(url);

    if (imageId){
      return vm.importImageFromImgur(imageId);
    } else {
      return vm.service.post('https://api.imgur.com/3/image', {
        image :url,
        type: 'URL',
        album: vm._album.hash
      }).then(function (response) {
        if (response.data.status === 200){
          return response.data.data;
        } else {
          return false;
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
      vm.$q.all(_.map(data.data, vm.importImageFromUrl, vm)).then(function(images){
        vm.addImage(images)
      });
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
    return vm.service.get('https://api.imgur.com/3/album/'+vm._album.id).then(function (response) {
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

    return vm.service.delete('https://api.imgur.com/3/album/'+vm._album.hash+'/remove_images', {
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
    return vm.service.delete('https://api.imgur.com/3/image/'+image.deletehash).then(function (response) {
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

    return vm.service.post('https://api.imgur.com/3/image', {
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
