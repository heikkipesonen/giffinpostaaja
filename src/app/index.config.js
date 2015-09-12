(function () {
  'use strict';

  angular
  .module('gifseina')
  .config(config);

  /** @ngInject */
  function config($logProvider, APIKEY, APISECRET, $httpProvider, cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    $httpProvider.defaults.headers.common.Authorization = 'Client-ID ' + APIKEY;
    // Enable log
    $logProvider.debugEnabled(true);

  }

})();
