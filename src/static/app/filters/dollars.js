'use strict';

angular.module('appstore').filter('dollars', function() {
  var currencies = {
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
  };

  return function(dollars, currency) {
    if (!currency || (dollars && dollars[currency] === undefined)) {
      currency = 'USD';
      var keys = _.keys(dollars);
      if (keys.length > 0 && keys.indexOf('USD') == -1) {
        currency = keys[0];
      }
    }

    var output = 'Free';
    if (dollars) {
      var amount = 0;
      if (dollars && dollars[currency]) {
        amount = dollars[currency];
      }

      if (amount > 0) {
        var symbol = currency + ' ';
        if (currencies[currency]) {
          symbol = currencies[currency];
        }

        output = symbol + amount.toFixed(2);
      }
    }

    return output;
  };
});
