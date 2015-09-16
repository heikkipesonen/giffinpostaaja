(function () {
	'use strict';

	angular.module('gifseina')
	.directive('showinfo', function ($timeout) {
		return {
			restrict:'A',
			link:function ($scope, $element) {

				var el = $element[0];

				// el.addEventListener('contextmenu', function (evt) {
				// 	evt.preventDefault();
				// 	showInfo();
				// })


				function showInfo(){
					var rowTop = el.offsetTop;
					var rowItems = [];

					for (var i in el.children){
						var child = el.children[i];

						var childOffsetTop = child.offsetTop;
						var childOffsetLeft = child.offsetLeft;

						if (child && child.getAttribute && childOffsetTop === rowTop){
							rowItems.push({e: child, left: childOffsetLeft});
						}
					}

					_.sortBy(rowItems, 'left');
					var lastChild = _.last(rowItems).e;
console.log(lastChild)
					var info = document.createElement('h2')
					info.innerHTML = 'PERDE';
					el.insertBefore(info,lastChild.nextSibling);
				}



			}
		};
	});

})();