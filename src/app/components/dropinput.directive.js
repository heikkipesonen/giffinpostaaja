(function () {
	'use strict';

	function DropController($q, $scope, $filter){
		var vm = this;
		vm.$scope = $scope;
		vm.$q = $q;
		vm.$filter = $filter;
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

	DropController.prototype.findImage = function (string) {
		var regex = new RegExp(/https?\:.+\.(jpg|gif|jpeg|png)/);
		// var regex = new RegExp(/http\:\/\/i\.imgur\.com\/[A-Za-z0-9]+\.(jpg|png|gif)/);
		var result = string.match(regex);
		if (result){
			return _.first(result);
		} else {
			return null;
		}
	};

	DropController.prototype.handleDrop = function (evt) {
		var vm = this;
		var imageImports = [];


		_.forEach(evt.dataTransfer.items, function (item) {
				var d = vm.$q.defer();
				imageImports.push(d.promise);

				item.getAsString(function (result) {
					var image = vm.findImage(result);
					d.resolve(image);
				});
			});

		vm.$q.all(imageImports).then(function (imageIds) {
				var images = _.compact(_.uniq(imageIds));
				vm.$scope.onFileRead({ data:{ type:'idlist',data:images } });
			});

		_.forEach(evt.dataTransfer.files, function (file) {
				if (vm.isAllowed(file)){
					vm.readFile(file).then(function (data) {
						var data = data.split('base64,');
						var type = data[0].replace('data:','').replace(';','');
						vm.$scope.onFileRead({ data:{ type:type, data: data[1] } });
					});
				}
			});
	};

	angular.module('dropinput',[])

	.service('dropState', function () {
		var vm = this;
		vm.disabled = false;
	})

	.directive('dropInput', function (dropState) {
		return {
			restrict:'A',
			scope:{
				onFileRead:'&'
			},
			bindToController:{},
			controller:DropController,
			controllerAs:'drop',
			link:function ($scope, $element, $attrs, $controller) {
				var el = $element[0];

				el.addEventListener('dragenter', function (evt) {
					evt.preventDefault();
					if (!dropState.disabled){
						evt.dataTransfer.dropEffect = 'copy';
					}
				});

				el.addEventListener('dragover', function (evt) {
					evt.preventDefault();
					if (!el.classList.contains('on-drop') && !dropState.disabled){
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

					if (!dropState.disabled){
						$controller.handleDrop(evt);
					}
				});
			}
		}
	});

})();