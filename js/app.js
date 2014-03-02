(function() {
	var app = angular.module('app', ['mgcrea.ngStrap.modal']);

	app.controller('mainCtrl', function ($scope, $http, $timeout, $modal) {
		$scope.apps = [];
		$scope.filter = '';
		$scope.$watch('filter', refresh);

		var db = new Nedb();
		function refresh() {
			var regex = new RegExp($scope.filter, 'i');
			console.log($scope.filter, regex);
			db.find({title: regex}).sort({title: 1}).exec(function(error, docs) {
				$timeout(function() {
					console.log(docs[0]);
					//$scope.apps = docs;
					var apps = [];
					var row = [];
					for (var i = 0; i < docs.length; i++) {
						row.push(docs[i]);
						if ((i + 1) % 6 == 0) {
							apps.push(angular.copy(row));
							row = [];
						}
					}

					if (row.length > 0) {
						apps.push(angular.copy(row));
					}

					$scope.apps = apps;
				});
			});
		}

		$http({url: 'click.php', method: 'GET'}).
			success(function(data) {
				db.insert(data);
				refresh();

			}).error(function() {
				console.log('error');
			});

		$scope.showApp = function(app) {
			$http({url: 'click.php', params: {url: app.resource_url}, method: 'GET'}).
			success(function(data) {
				$scope.app = data;
				var modal = $modal({scope: $scope, template: 'modal.html'});

			}).error(function() {
				console.log('error');
			});
		};
	});

	app.filter('price', function() {
		return function(price, currency) {
			if (currency) {
				price = price[currency];
			}

			var out = '$' + price;
			if (parseInt(price) == 0) {
				out = 'Free';
			}

			return out;
		};
	});

	app.filter('bytes', function() {
		return function(bytes) {
			var unit = 'B';

			if (bytes > 1024) {
				bytes /= 1024;
				unit = 'KB';

				if (bytes > 1024) {
					bytes /= 1024;
					unit = 'MB';

					if (bytes > 1024) {
						bytes /= 1024;
						unit = 'GB';

						if (bytes > 1024) {
							bytes /= 1024;
							unit = 'TB';
						}
					}
				}
			}

			return bytes.toFixed(2) + unit;
		};
	});
})();
