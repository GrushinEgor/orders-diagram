'use strict'
/**
* app Module
*
* Description
*/
angular.module('app', ['ui.bootstrap', 'Calendar']);

/**
* Calendar Module
*
* Description
*/
angular.module('Calendar', ['ui.bootstrap','ngDraggable'])
angular.module('app')
.controller('MainCtrl', ['$scope', '$http',function ($scope, $http) {
	function getPositions (count) {
		var positions = [];
		for (var i = 0; i < count; i++) {
			positions.push({
				id: i,
				name: 'Good ' + i
			});
		};
		return positions;
	}
	function initRandomItems (count) {
		var items = [];
		var currentMinDate = moment().subtract(Math.floor($scope.duration / 2), 'days');
		for (var i = 0; i < count; i++) {

			var shift = _.random(0, $scope.duration );
			var duration = _.random(1, $scope.duration);

			var startDate = moment(currentMinDate).add(shift, 'days');
			var endDate = moment(startDate).add(duration, 'days');
			var positionId = _.random(0, $scope.positions.length - 1);
			var statusId = _.random(0, $scope.statuses.length - 1);
			items.push({
				id: i,
				name: 'Order ' + i,
				startDate: startDate,
				endDate: endDate,
				positionId: positionId,
				customer: {
					lastName: 'Last Name ' + i
				},
				status: $scope.statuses[statusId]
			});
		};
		return items;
	}
	$scope.statuses = [{
		id: 0,
		name: 'in-progress'
	},
	{
		id: 1,
		name: 'ready'
	},
	{
		id: 2,
		name: 'denied'
	}];
	$scope.duration = 10;
	$scope.startDate = moment().subtract(Math.floor($scope.duration / 2), 'days');
	$scope.positions = getPositions(10);
	 $scope.items = initRandomItems(10);
	// console.log(JSON.stringify($scope.items));

	// $scope.items = getItems(); GET ITEMS FROM SERVER



	function getItems() {
		var newItems = get('get-items.php?startDate='+$scope.startDate+';duration='+$scope.duration);
		console.log(newItems);
	}

	$scope.dateChanged = function (newDate) {
		var newItems = get('get-items.php?startDate='+newDate+';duration='+$scope.duration);
		console.log(newItems);
	}
	$scope.itemChanged = function (item) {
		uploadItemChange(item);
	}
	$scope.itemCreated = function (item) {
		uploadItemCreate(item);
	}
	function post (url, data) {

		var postData = $.param(data);
		$http({
			url: url,
			method: "POST",
			data: postData,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
	}
	function get (url) {
		$http({
			url: url,
			method: "GET"
		}).success(function (data, status, headers, config) {
			return data;
		})
	}
	function uploadItemCreate (item) {
		post('item-create.php', item);
	}
	function uploadItemChange (item) {
		post('item-change.php', item);
	}
}])
angular.module('Calendar').controller('CalendarDialogCtrl', 
	['$scope', '$uibModalInstance', 'item', 'positions', 'statuses',
	function($scope, $uibModalInstance, item, positions, statuses){

		$scope.item = copyItem(item);




		function copyItem (itemToCopy) {
			var copy = {};
			copy.startDate = itemToCopy.startDate;
			copy.endDate = itemToCopy.endDate;
			copy.customer = {
				lastName: itemToCopy.customer.lastName
			};
			copy.status = itemToCopy.status;
			copy.positionId = itemToCopy.positionId;
			return copy;
		}
		$scope.positions = positions;
		$scope.statuses = statuses;

		$scope.selectedPosition = _.find($scope.positions, function(value, key, list){
			return value.id == $scope.item.positionId;
		});
		$scope.selectedStatus = _.find($scope.statuses, function(value, key, list){
			return value.id == $scope.item.status.id;
		});

		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		$scope.maxDate = new Date(2020, 5, 22);
		$scope.popup1 = {
			opened: false
		};
		$scope.popup2 = {
			opened: false
		};
		$scope.$watch('item.startDate', function() {
			$scope.item.startDate = moment($scope.item.startDate).format('DD-MMMM-YYYY');
		});
		$scope.$watch('item.endDate', function() {
			$scope.item.endDate = moment($scope.item.endDate).format('DD-MMMM-YYYY');
		});
		$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		$scope.altInputFormats = ['M!/d!/yyyy'];
		$scope.open1 = function() {
			$scope.popup1.opened = true;
		};
		$scope.open2 = function() {
			$scope.popup2.opened = true;
		};
		$scope.toggleMin = function() {
			$scope.minDate = $scope.minDate ? null : new Date();
		};



		$scope.close = function () {
			$uibModalInstance.close();
		}

		$scope.save = function () {
			item.startDate = $scope.item.startDate;
			item.endDate = $scope.item.endDate;
			item.customer.lastName = $scope.item.customer.lastName;
			item.status = $scope.selectedStatus;
			item.positionId = $scope.selectedPosition.id;
			$uibModalInstance.close(item);
		}

	}]);
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
				return 60 * daysCount + 1;
			}

			$scope.getLeft = function(item){
				var start = moment($scope.currentMinDate).startOf('day');
				var end = moment(item.startDate).startOf('day');

				var daysCount = end.diff(start, 'days', true);
				return 60 * daysCount;
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
angular.module('Calendar')
.service('CalendarService', function() {
 
});
angular.module('Calendar').filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString).format(format);
    };
});