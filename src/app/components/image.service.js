(function () {
	'use strict';

	function Imagestore () {
	}

	Imagestore.prototype.getDeleteHash = function (image) {
		if (image.description){
			var e = new RegExp(/#[a-zA-Z0-9]+#/);
			var p = _.first(image.description.match(e));
			return p ? p.replace(/\#/g,'') : null;
		}

		return null;
	};

	Imagestore.prototype.parseImages = function () {
		var vm = this;
		vm.images.reverse();
		vm.images.forEach(function (image) {
			vm.tags = image.title ? image.title.split(',') : [];
			// image.deletehash = image.description ? image.description.match(e).replace(/\#/g,'') : null;
		});
		console.log(this);
	};

	Imagestore.prototype.set = function (album) {
		var vm = this;
		angular.extend(vm, album);
		vm.parseImages();
	};

	angular.module('gifseina')
	.service('Imagestore', Imagestore);

})();