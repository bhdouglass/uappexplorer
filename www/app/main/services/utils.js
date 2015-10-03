'use strict';

angular.module('appstore').factory('utils', function($filter, $timeout, $location, gettextCatalog) {
  var url = $location.protocol() + '://' + $location.host() + '/';
  if ($location.port() != 80 && $location.port() != 443) {
    url = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/';
  }

  return {
    strToColor: function(str, css) { //Adapted from http://stackoverflow.com/a/16348977
      str = str ? str : '';

      var hash = 0;
      for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      var color = '#';
      for (var j = 0; j < 3; j++) {
          var v = (hash >> (j * 8)) & 0xFF;
          color += ('00' + v.toString(16)).substr(-2);
      }

      var value = color;
      if (css) {
        value = {};
        value[css] = color;
      }

      return value;
    },

    isFree: function(prices) {
      return ($filter('dollars')(prices) == 'Free');
    },

    loading: function($scope) {
      $scope.can_load = true;
      $scope.loading = false;
      $timeout(function() {
        if ($scope.can_load) {
          $scope.loading = true;
        }
      }, 250); //0.25 seconds
    },

    doneLoading: function($scope) {
      $scope.can_load = false;
      $scope.loading = false;
    },

    appIcon: function(app) {
      var icon = '';
      if (app) {
        icon = url + 'api/icon/' + app.icon_hash + '/' + app.name + '.png';
        /*if (app.cloudinary_url) {
          icon = app.cloudinary_url.replace('image/upload/', 'image/upload/c_scale,w_92/');
        }*/
      }

      return icon;
    },

    getSorts: function() {
      return [
        {
          label: gettextCatalog.getString('Most Relevant'),
          value: 'relevance',
        },
        {
          label: gettextCatalog.getString('Title A-Z'),
          value: 'title'
        }, {
          label: gettextCatalog.getString('Title Z-A'),
          value: '-title'
        }, {
          label: gettextCatalog.getString('Newest'),
          value: '-published_date'
        }, {
          label: gettextCatalog.getString('Oldest'),
          value: 'published_date'
        }, {
          label: gettextCatalog.getString('Latest Update'),
          value: '-last_updated'
        }, {
          label: gettextCatalog.getString('Oldest Update'),
          value: 'last_updated'
        }, {
          label: gettextCatalog.getString('Highest Heart Rating'),
          value: '-points'
        }, {
          label: gettextCatalog.getString('Lowest Heart Rating'),
          value: 'points'
        }, {
          label: gettextCatalog.getString('Highest Star Rating'),
          value: '-bayesian_average'
        }, {
          label: gettextCatalog.getString('Lowest Star Rating'),
          value: 'bayesian_average'
        }, {
          label: gettextCatalog.getString('Most Popular (This Month)'),
          value: '-monthly_popularity'
        }, {
          label: gettextCatalog.getString('Least Popular (This Month)'),
          value: 'monthly_popularity'
        }, {
          label: gettextCatalog.getString('Free'),
          value: 'prices.USD'
        }, {
          label: gettextCatalog.getString('Most Expensive (USD)'),
          value: '-prices.USD'
        },
      ];
    },
  };
});
