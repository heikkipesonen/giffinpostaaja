(function () {
	'use strict';

	angular.module('clipboard', [])
	.directive('copyClipboard', function () {
		return {
			restrict:'AC',
			link:function ($scope, $element) {
				var el = $element[0];

				el.addEventListener('click', copyContent);
				el.addEventListener('touchstart', copyContent);

				function copyContent(evt){
					evt.preventDefault();

					var input = document.createElement('textarea');
					document.body.appendChild(input);
					try{
						input.value = el.getAttribute('data-text');
						input.focus();
						input.select();
						document.execCommand('Copy');
					} catch (e) {
						alert(el.innerHTML)
					}
					input.remove();
				}
			}
		}
	});

})();