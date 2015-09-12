(function () {
	'use strict';

	angular
	.module('gifseina')
	.run(runBlock);

	/** @ngInject */
	function runBlock($log) {


		$log.debug('runBlock end');
	}

})();
