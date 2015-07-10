var spider = require('./spider/spider');
var elasticsearchPackage = require('./db/elasticsearchPackage');

function callback(err, value) {
  if (err) {
    process.exit(1);
  }

  if (value) {
    console.log(value);
  }

  process.exit(0);
}

if (process.argv[2]) {
  if (process.argv[2] == 'update' || process.argv[2] == 'updates') {
    spider.parsePackageUpdates(callback);
  }
  else if (process.argv[2] == 'dep' || process.argv[2] == 'department' || process.argv[2] == 'departments') {
    spider.parseDepartments(callback);
  }
  else if (process.argv[2] == 'review' || process.argv[2] == 'reviews') {
    if (process.argv[3] == 'bayesian') {
      spider.calculateBayesianAverages(function() {
        spider.mongoToElasticsearch(null, callback);
      });
    }
    else if (process.argv[3] == 'refresh') {
      spider.refreshRatings(function() {
        spider.mongoToElasticsearch(null, callback);
      });
    }
    else {
      spider.parseReviews(process.argv[3], callback);
    }
  }
  else if (process.argv[2] == 'type' || process.argv[2] == 'types') {
    if (process.argv[3]) {
      spider.parseClickPackageByName(process.argv[3], callback);
    }
    else {
      spider.parseAllClickPackages(function() {
        spider.mongoToElasticsearch(null, callback);
      });
    }
  }
  else if (process.argv[2] == 'mongoToElasticsearch') {
    spider.mongoToElasticsearch(null, callback);
  }
  else {
    spider.parsePackage(process.argv[2], function(err, pkg) {
      elasticsearchPackage.upsert(pkg, callback);
    });
  }
}
else {
  spider.parsePackages(callback);
}
