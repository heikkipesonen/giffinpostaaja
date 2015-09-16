(function () {
	'use strict';

	angular.module('ripple', [])

	.directive('ripple', function () {
		return {
			restrict:'C',
			link:function ($scope, $element) {
				var el = $element[0];
				var ripple = document.createElement('div');
				var timer = null;
				ripple.classList.add('ripple-effect');


				function handleClick(evt) {
					// evt.preventDefault();

					// if (el.firstChild){
						el.insertBefore(ripple, el.firstChild);
					// } else {
					// 	el.appendChild(ripple);
					// }

					el.classList.remove('ripple-active');
					el.classList.add('ripple-active');
					ripple.style.top = evt.layerY + 'px';
					ripple.style.left = evt.layerX + 'px';

					if (timer){
						clearTimeout(timer);
					}

					timer = setTimeout(function () {
						el.classList.remove('ripple-active');
						el.removeChild(ripple);
					}, 1000);
				}

				el.addEventListener('click', handleClick);
				el.addEventListener('contextmenu', handleClick);
			}
		}
	})
})();