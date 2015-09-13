(function () {
	'use strict';

	function Imagestore ($http, $q) {
		var vm = this;
		vm.$q = $q;
		vm.service = $http;
		vm.images = [];
		vm.tags = [];
	}

	Imagestore.prototype.getAllTags = function () {
		var vm = this;
		vm.tags = _.chain(vm.images).map(function (image) {
				return image.tags;
			}).flatten()
			.compact()
			.groupBy()
			.sortBy(function(group){
				return -group.length;
			}).map(function(tags){ return _.first(tags); })
			.slice(0,10)
			.valueOf();

		console.log(vm.tags)
	};

	Imagestore.prototype.updateImageTags = function (image) {
		var vm = this;
		if (image.can_update && image.deletehash){
	    return vm.service.post('https://api.imgur.com/3/image/'+image.deletehash, {
	      title:vm.getTagString(image)
	    }).then(function (updateResponse) {
	      return updateResponse.data;
	    });
		} else {
			var d = vm.$q.defer();
			d.reject(null);
			return d.promise;
		}
	};


	Imagestore.prototype.getDeleteHash = function (image) {
		if (image.description){
			var e = new RegExp(/#[a-zA-Z0-9]+#/);
			var p = _.first(image.description.match(e));
			return p ? p.replace(/\#/g,'') : null;
		}

		return null;
	};

	Imagestore.prototype.getTagString = function (image) {
		return image.tags ? image.tags.join(',') : null;
	};

	Imagestore.prototype.getTags = function (string) {
		var tags = string ? string.replace(/[^,\.\:\;\ a-zA-ZöäÖÄåÅ0-9]/g,'').split(/[\,\;\.\: ]{1}/) : [];
		return _.compact( _.map(_.uniq(tags), function (tag) { return _.trim(tag); }) );
	};

	Imagestore.prototype.parseImages = function () {
		var vm = this;
		vm.images.reverse();
		vm.images.forEach(function (image) {

			var deletehash = vm.getDeleteHash(image);

			if (deletehash){
				image.tags = vm.getTags(image.title);
				image.deletehash = deletehash;
				image.can_update = true;
			} else {
				image.can_update = false;
			}
			// image.deletehash = image.description ? image.description.match(e).replace(/\#/g,'') : null;
		});

		vm.getAllTags();
	};

	Imagestore.prototype.set = function (album) {
		var vm = this;
		angular.extend(vm, album);
		vm.parseImages();
	};

	angular.module('gifseina')
	.service('Imagestore', Imagestore);

})();