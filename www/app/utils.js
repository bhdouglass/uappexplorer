var currencies = {
  'USD': '$',
  'GBP': '£',
  'EUR': '€',
};

function normalizeCurrency(prices, currency) {
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

  return currency;
}

function price(prices, currency) {
  currency = normalizeCurrency(prices, currency);

  var amount = 0;
  if (prices && prices[currency]) {
    amount = prices[currency];
  }

  return amount;
}

module.exports = {
  price: function(prices, currency) {
    currency = normalizeCurrency(prices, currency);
    var p = price(prices, currency);
    var output = 'Free';
    if (p > 0) {
      var symbol = currency + ' ';
      if (currencies[currency]) {
        symbol = currencies[currency];
      }

      output = symbol + p.toFixed(2);
    }

    return output;
  },

  isFree: function(prices, currency) {
    return (price(prices, currency) === 0);
  },

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

  nl2br: function(input) {
    var output = '';
    if (input) {
      output = input;
    }

    output = output.replace('&', '&amp;').replace('>', '&gt;').replace('<', '&lt;');
    output = output.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
    return {__html: output};
  },
};
