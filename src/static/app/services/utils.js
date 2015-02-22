app.factory('utils', function($filter, $timeout) {
  return {
    strToColor: function(str, css) { //Adapted from http://stackoverflow.com/a/16348977
      str = str ? str : '';

      var hash = 0;
      for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      var color = '#';
      for (var i = 0; i < 3; i++) {
          var value = (hash >> (i * 8)) & 0xFF;
          color += ('00' + value.toString(16)).substr(-2);
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
          console.log('loading');
          $scope.loading = true;
        }
      }, 500); //0.5 seconds
    },

    doneLoading: function($scope) {
      $scope.can_load = false;
      $scope.loading = false;
    }
  };
});
