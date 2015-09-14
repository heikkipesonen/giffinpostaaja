(function () {
  'use strict';

  angular
  .module('gifseina')
  .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $http, ALBUM, Imagestore, $state, $filter) {
    var vm = this;

    vm._album = ALBUM;
    vm.album = Imagestore;
    vm.service = $http;
    vm.$scope = $scope;
    vm.$state = $state;
    vm.$filter = $filter;
    vm.childVisible = false;
    vm.importString = null;

    vm.$scope.$on('import.idlist', function (evt, data) {
      evt.stopPropagation();
      vm.importImages(data);
    });

    vm.$scope.$on('file.read', function (evt, data) {
      evt.stopPropagation();

      vm.upload(data).then(function (response) {
        console.log('image loaded', response);
      });
    });

    vm.$scope.$on('$stateChangeStart', function (f,to) {
      vm.childVisible = to.name === 'root.image';
    });

    vm.getAlbum();
  }

  MainController.prototype.importFromString = function (string) {
    var vm = this;
    if (string){
      var id = vm.$filter('imageId')(string);
      console.log(id);
      if (id && /^[A-Za-z0-9]{3,12}$/.test(id)){

        vm.service.get('https://api.imgur.com/3/image/'+id).then(function (response) {
          vm.importString = null;
          vm.addImage(response.data.data);
          vm.addAlbumImages([id]);
        }, function () {
          alert('voi perde teiän kanssa');
        });
      }
    }
  };

  MainController.prototype.showImage = function (image) {
    var vm = this;
    vm.$state.go('root.image', {id:image.id});
  };

  MainController.prototype.getAlbum = function () {
    var vm = this;
    return vm.service.get('https://api.imgur.com/3/album/'+vm._album.id).then(function (response) {
      vm.album.set(response.data.data);
      return response.data;
    })
  };

  MainController.prototype.addAlbumImages = function (idlist) {
    var vm = this;
    return vm.service.put('https://api.imgur.com/3/album/'+vm._album.hash+'/add', {
      ids:idlist
    });
  };

  MainController.prototype.removeAlbumImages = function (idlist) {
    var vm = this;
    return vm.service.delete('https://api.imgur.com/3/album/'+vm._album.hash+'/remove_images', {
      ids:idlist
    }).then(function (response) {
      if (response.data.status === 200){
        _.forEach(idlist, function (id) {
          _.remove(vm.album.images, {id: id});
        });
      } else {
        alert('pere');
      }
    })
  };

  MainController.prototype.importImages = function (idlist) {
    var vm = this;
    return vm.addAlbumImages(idlist).then(function (response) {
      if (response.data.status === 200){
        _.forEach(idlist, function (id) {
          vm.service.get('https://api.imgur.com/3/image/'+id).then(function (response) {
            vm.addImage(response.data.data);
          });
        })
      }
    });
  };


  MainController.prototype.addImage = function (image) {
    var vm = this;
    vm.album.images.unshift(image);
  };


  MainController.prototype.upload = function (image) {
    var vm = this;

    return vm.service.post('https://api.imgur.com/3/image', {
      album: vm._album.hash,
      image: image.data,
      type: image.type
    }).then(function (response) {
      if (response.data.status === 200){
        var imageData = response.data.data;
        vm.addImage(imageData);

        return vm.service.post('https://api.imgur.com/3/image/'+imageData.deletehash, {
          description: '#'+imageData.deletehash+'#',
          title:''
        }).then(function (updateResponse) {
          return response.data;
        });
      } else {
        return false;
      }
    });
  };

})();
