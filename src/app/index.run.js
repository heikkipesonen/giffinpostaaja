(function () {
	'use strict';

	angular
	.module('gifseina')
	.run(runBlock);

	/** @ngInject */
	function runBlock($log, $rootScope, $state) {

		// $rootScope.$on('$stateChangeError', function () {
		// 	$state.go('root');
		// });

		$log.debug('runBlock end');
	}

})();
