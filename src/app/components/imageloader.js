(function () {
'use strict';

angular.module('imageLoader', [])

	.constant('IMAGE_SIZES',[
    { name:'s', size:90 },
    { name:'b', size:160 },
    { name:'m', size:320, proportions:true },
    { name:'l', size:640, proportions:true },
    { name:'h', size:1024, proportions:true }
  ])

  .filter('imageId', function () {
	return function (url) {

		if (url.indexOf('http://i.imgur.com/') > -1){
			var id = url.replace(/[sbmlh]{1}\.(jpg|gif|png)/,'');
			id = id.replace('http://i.imgur.com/','');
			id = id.replace(/\.(jpg|gif|png|webm|gifv|mp4)/,'');

			return id;
		} else {
			return null;
		}

	}
  })

	.filter('thumbnail', function () {
		return function (url, size) {
			return url.replace(/(\w+)(\.\w+)$/i, '$1'+size+'$2');
		};
	})

	.directive('imageLoader', function ($filter) {
		return {
			restrict:'A',
			scope:{
				imageLoader:'=',
				size:'@?'
			},
			link:function ($scope, $element, $attrs) {
				var el = $element[0];
				var img = null;

				function loadComplete(){
					el.classList.remove('image-loading');
					el.classList.add('image-ready');

					if (el.nodeName === 'IMG'){
						el.src = img.src;
					} else {
						el.style['background-image'] = 'url('+img.src+')';
					}

					img = null;
				}

				function preload(){
					var image = $scope.imageLoader;

					if (image.nsfw) el.classList.add('image-nsfw');

					el.classList.add('image-loading');
					el.classList.remove('image-ready');
					img = new Image();

					img.onload = function () {
							loadComplete();
						};

					img.onerror = function () {
							el.classList.add('image-error');
							loadComplete();
						};

					var link = image.link;

					if (/\.(gif|jpg|jpeg|png|gifv|mp4)$/i.test(link)){
						if ($scope.size){
							link = $filter('thumbnail')(link, $scope.size);
						}

						img.src = link;
					} else {
						img.src = null;
					}

				}

				preload();
				// $scope.$watch('imageLoader', function(newVal, oldVal){
				// 	if (newVal === oldVal && img && img.src) return;
				// 	preload();
				// });
			}
		};
	});
})();