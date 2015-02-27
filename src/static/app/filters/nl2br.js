'use strict';

angular.module('appstore').filter('nl2br', function($sce){
  return function(input) {
    var output = '';
    if (input) {
      output = input;
    }

    output = output.replace('&', '&amp;').replace('>', '&gt;').replace('<', '&lt;');
    output = output.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
    return $sce.trustAsHtml(output);
  };
});
