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