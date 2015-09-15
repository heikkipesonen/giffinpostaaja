(function () {
	'use strict';

	angular.module('gifseina')

	.directive('droppable', function () {
		return {
			scope:{
				onDrop:'&'
			},
			restrict:'A',
			link:function ($scope, $element, $attrs) {
				var el = $element[0];

				el.addEventListener('dragover', function (evt) {
					evt.preventDefault();
					evt.stopPropagation();
					evt.dataTransfer.dropEffect = 'move';

					if (!el.classList.contains('on-drag')){
						el.classList.add('on-drag');
					}
				});

				el.addEventListener('dragleave', function (evt) {
					el.classList.remove('on-drag');
				});

				el.addEventListener('drop', function (evt) {
					evt.stopPropagation();
					evt.preventDefault();


					el.classList.remove('on-drag');

					if ($scope.onDrop){
						$scope.onDrop()
					}
				});
			}
		}
	})

	.directive('draggable', function () {
		return {
			scope:{
				dragStart:'&',
				dragEnd:'&'
			},
			restrict:'A',
			link:function ($scope, $element, $attrs) {
				var el = $element[0];
				el.addEventListener('dragend', function (evt) {
					evt.preventDefault();
					evt.stopPropagation();
					if ($scope.dragEnd)	$scope.dragEnd();
				});
				el.addEventListener('dragstart', function (evt) {
					evt.dataTransfer.dragEffect = 'move';
					evt.dataTransfer.setData('type',el.getAttribute('data-type'));
					evt.dataTransfer.setData('$id',el.getAttribute('data-drag'));
					if ($scope.dragStart)	$scope.dragStart();
				});
			}
		};
	});

})();