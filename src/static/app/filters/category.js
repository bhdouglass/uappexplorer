'use cache';

app.filter('category', function() {
  return function(category) {
    if (category.indexOf('-') > 0) {
      var index = category.indexOf('-') + 1;
      category = category.substr(0, index) + category.charAt(index).toUpperCase() + category.substr(index + 1);
      category = category.replace('-', ' / ');
    }

    return category;
  };
});
