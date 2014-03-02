(function() {
	var app = angular.module('app', ['mgcrea.ngStrap.modal']);

	app.controller('mainCtrl', function ($scope, $timeout, $modal, clickapps) {
		$scope.apps = [];
		$scope.categories = clickapps.categories;
		$scope.search = '';
		$scope.category = null;

		$scope.$watch('search', refresh);
		$scope.$watch('category', refresh);

		function refresh(refreshCategory) {
			var regex = new RegExp($scope.search, 'i');
			var filter = {title: regex}
			if ($scope.category) {
				filter.category = new RegExp($scope.category.replace(' > ', ';'));
				console.log($scope.category);
			}

			clickapps.apps.find(filter).sort({title: 1}).exec(function(error, docs) {
				$timeout(function() {
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
		var categories = [];
		var apps = new Nedb();//TODO cache locally

		var clickapps = {
			categories: categories,

			apps: apps,

			findAll: function() {
				return $http({url: 'http://localhost:8080/apps', method: 'GET'}).
					success(function(data) {
						apps.insert(data);
						clickapps.categories.length = 0;

						angular.forEach(data, function(app) {
							if (app.category !== undefined) {
								var parent = app.category.split(';')[0];
								if (clickapps.categories.indexOf(parent) == -1) {
									clickapps.categories.push(parent);
								}

								var category = app.category.replace(';', ' > ');
								if (clickapps.categories.indexOf(category) == -1) {
									clickapps.categories.push(category);
								}
							}
						});
						clickapps.categories.sort();

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
