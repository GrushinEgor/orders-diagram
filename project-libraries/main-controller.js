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