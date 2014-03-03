(function() {
	var app = angular.module('app', ['mgcrea.ngStrap.modal']);

	app.controller('mainCtrl', function ($scope, $timeout, $modal, clickapps) {
		$scope.apps = [];
		$scope.categories = [];
		$scope.search = '';
		$scope.category = null;

		$scope.$watch('search', refresh);
		$scope.$watch('category', refresh);

		function refresh(refreshCategory) {
			var regex = new RegExp($scope.search, 'i');
			var filter = {title: regex}

			console.log($scope.category);
			if ($scope.category) {
				var category = $scope.category.replace(' > ', ';').split(' ')[0];
				if (category != 'Any') {
					filter.category = new RegExp(category);
				}
			}

			clickapps.apps.find(filter).sort({title: 1}).exec(function(error, docs) {
				$timeout(function() {
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

		clickapps.category_stats().then(function(response) {
			var count = 0;
			angular.forEach(response.data, function(value, key) {
				$scope.categories.push(key.replace(';', ' > ') + ' (' + value + ')');

				if (key == 'Any') {
					$scope.category = $scope.categories[count];
				}

				count++;
			});

			$scope.categories.sort();
		});

		$scope.loading = true;
		clickapps.findAll().then(function() {
			refresh();
			$scope.loading = false;
		});

		$scope.showApp = function(app) {
			clickapps.find(app.name).then(function(response) {
				$scope.app = response.data;
				var modal = $modal({scope: $scope, template: 'modal.html'});
			});
		};

		$scope.hideAndChangeCategory = function(hide, app) {
			hide();
			angular.forEach($scope.categories, function(category) {
				if (category.replace(' > ', ';').split(' ')[0] == app.category) {
					$scope.category = category;
				}
			});
		};

		$scope.changeCategory = function(app) {
			$scope.category = app.category.split(';')[0];
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

	app.service('clickapps', function($http) {
		var apps = new Nedb();//TODO cache locally

		var clickapps = {
			apps: apps,

			categories: function() {
				return $http({url: 'http://localhost:8080/categories', method: 'GET'}).
					error(function(data, status) {
						console.log('categories error', data, status);
					});
			},

			category_stats: function() {
				return $http({url: 'http://localhost:8080/category_stats', method: 'GET'}).
				error(function(data, status) {
					console.log('category_stats error', data, status);
				});
			},

			findAll: function() {
				return $http({url: 'http://localhost:8080/apps', method: 'GET'}).
					success(function(data) {
						apps.insert(data);

					}).error(function(data, status) {
						console.log('findAll error', data, status);
					});
			},

			find: function(name) {
				return $http({url: 'http://localhost:8080/app/' + name, method: 'GET'}).
					success(function(data) {
						//TODO insert into apps
					}).error(function(data, status) {
						console.log();
					});
			}
		}

		return clickapps;
	});
})();
