(function () {
  'use strict';

  angular
  .module('gifseina')
  .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $http, ALBUM) {
    var vm = this;

    vm._album = ALBUM;
    vm.album = null;
    vm.service = $http;
    vm.$scope = $scope;

    vm.$scope.$on('file.read', function (evt, data) {
      evt.stopPropagation();

      vm.upload(data).then(function (response) {
        console.log('image loaded', response);
      });
    });


    vm.getAlbum();
  }

  // MainController.prototype.copyToClipboard = function (evt, image) {
  //   var range = document.createRange();
  //   var el = evt.srcElement.parentNode.querySelector('.image-embed');
  //   range.selectNode(el);
  //   console.log(el)
  //   window.getSelection().addRange(range);
  //   var success = document.execCommand('copy');

  //   window.getSelection().removeAllRanges();
  // }

  MainController.prototype.getAlbum = function () {
    var vm = this;
    return vm.service.get('https://api.imgur.com/3/album/'+vm._album.id).then(function (response) {
      vm.album = response.data.data;
      vm.album.images.reverse();
      return response.data;
    })
  };


  MainController.prototype.upload = function (image) {
    var vm = this;

    return vm.service.post('https://api.imgur.com/3/image', {
      album: vm._album.hash,
      image: image.data,
      type: image.type
    }).then(function (response) {
      var imageData = response.data.data;
      vm.album.images.unshift(imageData);

      return vm.service.post('https://api.imgur.com/3/image/'+imageData.deletehash, {
        description: '#'+imageData.deletehash+'#',
        title:'op,faget,is,true'
      }).then(function (updateResponse) {
        return response.data;
      });
    });
  };

})();
