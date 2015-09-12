(function () {
	'use strict';

	angular.module('clipboard', [])
	.directive('copyClipboard', function () {
		return {
			restrict:'AC',
			link:function ($scope, $element) {
				var el = $element[0];

				el.addEventListener('mousedown', copyContent);
				el.addEventListener('touchstart', copyContent);

				function copyContent(){
					 var input = document.createElement('textarea');
					document.body.appendChild(input);
					input.value = el.innerHTML;
					input.focus();
					input.select();
					document.execCommand('Copy');
					input.remove();
					// var range = document.createRange();
					// range.selectNodeContents(el);
					// window.getSelection().addRange(range);
					// var success = document.execCommand('copy');

					// console.log(success)
					// window.getSelection().removeAllRanges();
				}
			}
		}
	});

})();