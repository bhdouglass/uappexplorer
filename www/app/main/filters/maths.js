'use strict';

angular.module('appstore').filter('maths', function() {
  return function(input, property, operator, value) {
    var output = [];

    _.forEach(input, function(i) {
      if (operator == 'gt' && i[property] > value) {
        output.push(i);
      }
      else if (operator == 'gte' && i[property] >= value) {
        output.push(i);
      }
      else if (operator == 'lt' && i[property] < value) {
        output.push(i);
      }
      else if (operator == 'lte' && i[property] <= value) {
        output.push(i);
      }
      else if (operator == 'eq' && i[property] == value) {
        output.push(i);
      }
    });

    return output;
  };
});
