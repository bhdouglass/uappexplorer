var currencies = {
  'USD': '$',
  'GBP': '£',
  'EUR': '€',
};

module.exports = {
  price: function(prices, currency) {
    if (!currency || (prices && prices[currency] === undefined)) {
      currency = 'USD';

      var keys = [];
      for (var key in prices) {
        keys.push(key);
      }

      if (keys.length > 0 && keys.indexOf('USD') == -1) {
        currency = keys[0];
      }
    }

    var output = 'Free';
    if (prices) {
      var amount = 0;
      if (prices && prices[currency]) {
        amount = prices[currency];
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
  },
};
