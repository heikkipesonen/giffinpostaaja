(function () {
  'use strict';

  angular
  .module('gifseina')
  .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $http, ALBUM, Imagestore, $state, $filter, $firebaseArray, $timeout, dropState) {
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
    vm.childVisible = false;
    vm.importString = null;
    vm.showTools = false;

    // vm.getAlbum();
    // vm.$scope.$on('import.idlist', function (evt, data) {
    //   evt.stopPropagation();
    //   vm.importImages(data);
    // });

    vm.$scope.$on('file.read', function (evt, data) {
      evt.stopPropagation();
      vm.upload(data);
    });

    vm.$scope.$on('$stateChangeStart', function (f,to) {
      vm.childVisible = to.name === 'root.image';
    });


    // vm.$scope.$on('drop', function (evt, data) {
    //   vm.showTools = false;
    //   console.log(data);
    //   $timeout(function(){});
    // });

  }


  MainController.prototype.importFile = function (data){
console.log(this)
    console.log(arguments);
  }

  MainController.prototype.imageDragStart = function (image) {
    var vm = this;
    vm.showTools = true;
    vm.dropState.disabled = true;
    vm.dragImage = image;
    vm.$timeout(function(){});
  };

  MainController.prototype.imageDragEnd = function (image) {
    var vm = this;

    vm.dropState.disabled = false;
    vm.showTools = false;
    vm.dragImage = null;
    vm.$timeout(function(){});
  };

  // MainController.prototype.importFromString = function (string) {
  //   var vm = this;
  //   if (string){
  //     var id = vm.$filter('imageId')(string);
  //     console.log(id);
  //     if (id && /^[A-Za-z0-9]{3,12}$/.test(id)){

  //       vm.service.get('https://api.imgur.com/3/image/'+id).then(function (response) {
  //         vm.importString = null;
  //         vm.addImage(response.data.data);
  //         vm.addAlbumImages([id]);
  //       }, function () {
  //         alert('voi perde teiän kanssa');
  //       });
  //     }
  //   }
  // };

  // MainController.prototype.showImage = function (image) {
  //   var vm = this;
  //   vm.$state.go('root.image', {id:image.id});
  // };

  MainController.prototype.getAlbum = function () {
    var vm = this;
    return vm.service.get('https://api.imgur.com/3/album/'+vm._album.id).then(function (response) {

      // vm.data.images
      response.data.data.images.forEach(function(image){
        vm.addImage(image);
      });
      // vm.data.$save();

      // vm.album.set(response.data.data);
      return response.data;
    });
  };

  MainController.prototype.removeImage = function (image) {
    var vm = this;
    console.log(image);
    if (image.deletehash){
      vm.deleteFromImgur(image.deletehash);
    }
    vm.images.$remove(image);
  };

  MainController.prototype.deleteFromImgur = function (idlist) {
    if (!_.isArray(idlist)){
      idlist = [idlist];
    }

    return vm.service.delete('https://api.imgur.com/3/album/'+vm._album.hash+'/remove_images', {
      params: {
        ids: idlist
      }
    });
  };

  // MainController.prototype.addAlbumImages = function (idlist) {
  //   var vm = this;
  //   return vm.service.put('https://api.imgur.com/3/album/'+vm._album.hash+'/add', {
  //     ids:idlist
  //   });
  // };

  // MainController.prototype.removeAlbumImages = function (idlist) {
  //   var vm = this;
  //   return vm.service.delete('https://api.imgur.com/3/album/'+vm._album.hash+'/remove_images', {
  //     params: {
  //       ids: idlist
  //     }
  //   }).then(function (response) {
  //     if (response.data.status === 200){
  //       _.forEach(idlist, function (id) {
  //         _.remove(vm.album.images, {id: id});
  //       });
  //     } else {
  //       alert('pere');
  //     }
  //   })
  // };

  // MainController.prototype.importImages = function (idlist) {
  //   var vm = this;
  //   return vm.addAlbumImages(idlist).then(function (response) {
  //     if (response.data.status === 200){
  //       _.forEach(idlist, function (id) {
  //         vm.service.get('https://api.imgur.com/3/image/'+id).then(function (response) {
  //           vm.addImage(response.data.data);
  //         });
  //       })
  //     }
  //   });
  // };


  // MainController.prototype.addImage = function (image) {
  //   var vm = this;
  //   vm.album.images.unshift(image);
  // };

  MainController.prototype.importImage = function (imageId) {
    var vm = this;
    vm.service.get('https://api.imgur.com/3/image/'+id).then(function (response) {
      vm.addImage(response.data.data);
    });
  };

  MainController.prototype.addImage = function (image) {
    var vm = this;
    vm.images.$add(image);
  };


  MainController.prototype.upload = function (image) {
    var vm = this;

    return vm.service.post('https://api.imgur.com/3/image', {
      album: vm._album.hash,
      image: image.data,
      type: image.type
    }).then(function(response){
      if (response.data.status === 200){
        vm.addImage(response.data.data);
      }
    });
    // return vm.service.post('https://api.imgur.com/3/image', {
    //   album: vm._album.hash,
    //   image: image.data,
    //   type: image.type
    // }).then(function (response) {
    //   if (response.data.status === 200){
    //     var imageData = response.data.data;
    //     vm.addImage(imageData);

    //     return vm.service.post('https://api.imgur.com/3/image/'+imageData.deletehash, {
    //       description: '#'+imageData.deletehash+'#',
    //       title:''
    //     }).then(function (updateResponse) {
    //       return response.data;
    //     });
    //   } else {
    //     return false;
    //   }
    // });
  };

})();
