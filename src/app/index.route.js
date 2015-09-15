(function () {
  'use strict';

  angular
  .module('gifseina')
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('root', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })

      .state('root.image', {
        resolve:{
          image:function (Imagestore, $stateParams, $q) {
            var d = $q.defer();
            var image = _.find(Imagestore.images, { id:$stateParams.id });

            if (image){
              d.resolve(image);
            } else {
              d.reject();
            }
            return d.promise;
          }
        },
        url:':id',
        templateUrl:'app/image/image.html',
        controller:'ImageController',
        controllerAs:'image'
      })

      .state('root.import', {
        resolve:{
        },
        url:'import',
        templateUrl:'app/import/import.html',
        controller:'ImportController',
        controllerAs:'import'
      })
      ;

    $urlRouterProvider.otherwise('/');
  }

})();
