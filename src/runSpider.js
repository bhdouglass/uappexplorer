var spider = require('./spider/spider');
var snaps = require('./spider/snaps');
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
  if (process.argv[2] == 'snaps' || process.argv[2] == 'snap') {
    snaps.fetchSnaps().then(() => {
      process.exit(0);
    });
  }
  else if (process.argv[2] == 'update' || process.argv[2] == 'updates') {
    spider.parsePackages(true, callback);
  }
  else if (process.argv[2] == 'dep' || process.argv[2] == 'department' || process.argv[2] == 'departments') {
    spider.parseDepartments(callback);
  }
  else if (process.argv[2] == 'review' || process.argv[2] == 'reviews') {
    if (process.argv[3] == 'refresh') {
      spider.refreshRatings(function() {
        elasticsearchPackage.mongoToElasticsearch(null, callback);
      });
    }
    else {
      spider.parseReviews(process.argv[3], null, null, callback);
    }
  }
  else if (process.argv[2] == 'type' || process.argv[2] == 'types') {
    if (process.argv[3]) {
      spider.parseClickPackageByName(process.argv[3], callback);
    }
    else {
      spider.parseAllClickPackages(function() {
        elasticsearchPackage.mongoToElasticsearch(null, callback);
      });
    }
  }
  else if (process.argv[2] == 'mongoToElasticsearch') {
    elasticsearchPackage.mongoToElasticsearch(null, true, callback);
  }
  else if (process.argv[2] == 'reparsePackagesMissingTypes') {
    spider.reparsePackagesMissingTypes(callback);
  }
  else {
    spider.parsePackageByName(process.argv[2], callback);
  }
}
else {
  spider.parsePackages(false, callback);
}
