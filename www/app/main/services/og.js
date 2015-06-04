'use strict';

angular.module('appstore').service('og', function($rootScope, $state, $location) {
  var url = $location.protocol() + '://' + $location.host() + '/';
  var defaultTitle = 'uApp Explorer';
  var defaultOg = {
    title: defaultTitle,
    description: 'Browse and discover apps for Ubuntu Touch',
    image: url + 'img/logo.png',
    url: url + 'apps',
  };

  $rootScope.title = defaultTitle;
  $rootScope.og = angular.copy(defaultOg);

  $rootScope.$on('$stateChangeStart', function() {
    $rootScope.title = defaultTitle;
    $rootScope.og = angular.copy(defaultOg);
  });

  return {
    set: function(title, og) {
      og = angular.extend(defaultOg, og);
      og.title = title;
      og.image = og.image.replace('{url}', url);
      og.url = og.url.replace('{url}', url);

      if (title != defaultTitle) {
        title = title + ' - ' + defaultTitle;
      }

      $rootScope.title = title;
      $rootScope.og = og;
    }
  };
});
