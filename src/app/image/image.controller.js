(function () {
	'use strict';

	function ImageController ($scope, image, Imagestore, $timeout) {
		var vm = this;
		vm.store = Imagestore;
		vm.model = image;
		vm.$scope = $scope;
		vm.$timeout = $timeout;
		vm.updateTimer = null;
		vm.updateInterval = 1000;
		vm.disabled = false;

		vm.tagString = vm.model.title;
		vm.tags = vm.store.getTags(vm.tagString);

		var updateTags = vm.updateTags.bind(vm);

		vm.$scope.$watch(function(){
			return vm.tagString;
		}, updateTags);
	}

	ImageController.prototype.updateTags = function (newtags, oldtags) {
		var vm = this;
		vm.tags = vm.store.getTags(vm.tagString);

			// if (vm.updateTimer){
			// 	vm.$timeout.cancel(vm.updateTimer);
			// }

			// vm.updateTimer = vm.$timeout(function () {
			// 	vm.saveTags();
			// }, vm.updateInterval);
	};

	ImageController.prototype.saveTags = function () {
		var vm = this;
		vm.disabled = true;

		if (_.difference(vm.tags, vm.model.tags).length > 0 ||  _.difference(vm.model.tags, vm.tags).length > 0 ){
			vm.model.title = vm.tagString;
			vm.model.tags = vm.store.getTags(vm.tagString);

			vm.store.updateImageTags(vm.model).then(function (response) {
				vm.disabled = false;
			});
		}
	};



	angular.module('gifseina')
	.controller('ImageController', ImageController);
})();