var mongoose = require('mongoose');

var departmentSchema = mongoose.Schema({
  internal_name: {type: String, index: true},
  name: String,
  url: String,
});

var Department = mongoose.model('Department', departmentSchema);

exports.Department = Department;
