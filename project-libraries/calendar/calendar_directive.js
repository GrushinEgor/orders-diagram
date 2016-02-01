angular.module('Calendar')
.directive('calendar', function() {
	return {
		restrict: 'E',
		scope: {
			items: '=items',
			'positions': '=positions',
			'duration': '=duration',
			'statuses': '=statuses',
			'startDate': '=startDate',
			dateChangedFn: '&dateChanged',
			itemChangedFn: '&itemChanged',
			itemCreatedFn: '&itemCreated',
		},
		templateUrl: '../static/html-templates/calendar.tmpl.html',
		link: function(scope, element, attr) {
		},
		replace: true,
		controller: ['$scope', '$rootScope', '$uibModal', function($scope, $rootScope, $uibModal) {
			$scope.currentMinDate;
			function initDays(count){
				var days = [];
				var middleDayIndex = Math.floor(count / 2);
				var startDate = $scope.startDate;

				if(!startDate){
					startDate = moment().subtract(Math.floor($scope.duration / 2), 'days');
				}

				for (var i = 0; i < count; i++) {
					var newDay = moment(startDate).add(i + 1, 'days'); 
					days.push(newDay);
				};
				$scope.currentMinDate = _.first(days);
				$scope.currentMaxDate = _.last(days);
				return days;
			}
			$scope.days = initDays($scope.duration);
			$scope.getItemsByPosition = function (position) {

				var items = _.filter($scope.items, function(value, key, list){
					return value.positionId === position.id;
				});
				return items;
			}
			$scope.nextDate = function () {
				var newMaxDate = moment($scope.currentMinDate).add($scope.duration, 'days');
				$scope.days.shift();
				$scope.days.push(newMaxDate);
				updateDateVariables();
			}
			$scope.prevDate = function () {
				var newMinDate = moment($scope.currentMinDate).subtract(1, 'days');
				$scope.days.unshift(newMinDate);
				$scope.days.pop();
				updateDateVariables();
			}

			$scope.isAvailable = function (item) {
				var endDate =  moment(item.endDate).startOf('day');
				var startDate = moment(item.startDate).startOf('day');
				var minDate = moment($scope.currentMinDate)
				.startOf('day')
				.subtract(1, 'days');
				var maxDate = moment($scope.currentMaxDate)
				.startOf('day')
				.add(1, 'days');

				var oneCase =  moment(startDate).isBetween(minDate, maxDate);
				var anotherCase =  moment(endDate).isBetween(minDate, maxDate);

				return oneCase || anotherCase;
			}


			$scope.getWidth = function(item){
				var start = moment(item.startDate).startOf('day');
				var end = moment(item.endDate).startOf('day');


				var daysCount = end.diff(start, 'days', true) + 1;
				return 60 * daysCount - 1;
			}

			$scope.getLeft = function(item){
				var start = moment($scope.currentMinDate).startOf('day');
				var end = moment(item.startDate).startOf('day');

				var daysCount = end.diff(start, 'days', true);
				return 60 * daysCount + 1;
			}

			$scope.onDropComplete=function(data,$event, position, day){
				
				if(!data) return;
				var start = moment(data.startDate).startOf('day');
				var end = moment(data.endDate).startOf('day');
				var daysCount = end.diff(start, 'days', true);
				var newStartDate = moment(day);
				var newEndDate = moment(day).add(daysCount, 'days');
				
				data.positionId = position.id;
				data.startDate = newStartDate;
				data.endDate = newEndDate;


			}

			var draggableMoveCount;
			$rootScope.$on('draggable:start', function (data) {
				draggableMoveCount = 0;
			});
			$rootScope.$on('draggable:move', function (data) {
				// isDragging = true;
				draggableMoveCount++;
			});
			

			$scope.changeItem = function ($event, item) {
				if(draggableMoveCount > 1){
					draggableMoveCount = 0;
					return;
				} 
				$event.stopPropagation();
				var copyItem = angular.extend({}, item);
				var changeItemDialog = {
					animation: true,
					templateUrl: '../static/html-templates/calendar-dialog.tmpl.html',
					controller: 'CalendarDialogCtrl',
					size: "md",
					resolve: {
						item: function () {
							return item;	
						},
						positions: function () {
							return $scope.positions;
						},
						statuses: function () {
							return $scope.statuses;
						}
					}
				};
				$uibModal.open(changeItemDialog)
				.result.then(function (editedItem) {
					$scope.itemChangedFn(item);
				});;
			}

			$scope.createItem = function ($event, position, day) {
				
				$event.stopPropagation();
				var newItem = {
					positionId: position.id,
					startDate: moment(day),
					endDate: moment(day).add(1, 'days'),
					status: $scope.statuses[0],
					customer: {
						lastName: null
					}
				};
				var createItemDialog = {
					animation: true,
					templateUrl: '../static/html-templates/calendar-dialog.tmpl.html',
					controller: 'CalendarDialogCtrl',
					size: "md",
					resolve: {
						item: function () {
							return newItem;	
						},
						positions: function () {
							return $scope.positions;
						},
						statuses: function () {
							return $scope.statuses;
						}
					}
				};
				$uibModal.open(createItemDialog)
				.result.then(function (item) {
					$scope.items.push(item);
					$scope.itemCreatedFn(item);
				});
			}




			function updateDateVariables () {
				$scope.currentMinDate = _.first($scope.days);
				$scope.currentMaxDate = _.last($scope.days);
				$scope.dateChangedFn({newDate: $scope.currentMinDate});
			}
		}]
	};
});