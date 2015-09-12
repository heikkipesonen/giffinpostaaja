(function () {
	'use strict';

	function DropController($q, $scope){
		var vm = this;
		vm.$scope = $scope;
		vm.$q = $q;
		vm.allowedTypes = ['image/gif','image/jpg','image/png','image/jpeg'];
		vm.maxFileSize = 10 * 1014 * 1024;
	}

	DropController.prototype.isAllowed = function (file) {
		var vm = this;
		return (vm.allowedTypes.indexOf(file.type) > -1 && file.size < vm.maxFileSize);
	};


	DropController.prototype.readFile = function (file) {
		var vm = this;
		var d = vm.$q.defer();
		var fileReader = new FileReader();

		fileReader.onloadend = function () {
			d.resolve(fileReader.result);
		};

		fileReader.readAsDataURL(file);
		return d.promise;
	};

	DropController.prototype.handleDrop = function (evt) {
		var vm = this;


		// var promises = [];
		_.forEach(evt.dataTransfer.files, function (file) {
			if (vm.isAllowed(file)){
				vm.readFile(file).then(function (data) {
					var data = data.split('base64,');
					var type = data[0].replace('data:','').replace(';','');

					vm.$scope.$emit('file.read',{ type:type, data: data[1] });
				});
				// promises.push(vm.readFile(file));
			}
		});

		// vm.$q.all(promises).then(function (responses) {
		// 	console.log(responses)
		// 	vm.data = responses;
		// });
	};

	angular.module('dropinput',[])

	.directive('dropInput', function () {
		return {
			restrict:'A',
			scope:{},
			bindToController:{},
			controller:DropController,
			controllerAs:'drop',
			link:function ($scope, $element, $attrs, $controller) {
				var el = $element[0];

				el.addEventListener('dragenter', function (evt) {
					evt.preventDefault();
					evt.dataTransfer.dropEffect = 'copy';
				});

				el.addEventListener('dragover', function (evt) {
					evt.preventDefault();
					if (!el.classList.contains('on-drop')){
						el.classList.add('on-drop');
					}
				});


				el.addEventListener('dragleave', function (evt) {
					el.classList.remove('on-drop');
				});


				el.addEventListener('drop', function (evt) {
					evt.stopPropagation();
					evt.preventDefault();
					el.classList.remove('on-drop');

					$controller.handleDrop(evt);
				});
			}
		}
	});

})();