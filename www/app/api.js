var axios = require('axios');
var utils = require('./utils');

module.exports = {
  getCounts: function() {
    return axios.get('/api/apps/counts').then(function(res) {
      return res.data.data;
    });
  },

  getEssentials: function() {
    return axios.get('/api/apps/essentials').then(function(res) {
      return utils.shuffle(res.data.data);
    });
  },

  getApps: function(params) {
    return axios.get('/api/apps', {params: params}).then(function(res) {
      return res.data.data;
    });
  },

  getFrameworks: function() {
    return axios.get('/api/frameworks').then(function(res) {
      return res.data.data;
    });
  },

  getApp: function(name) {
    return axios.get('/api/apps/' + name).then(function(res) {
      return res.data.data;
    });
  },

  getReviews: function(name, params) {
    return axios.get('/api/apps/reviews/' + name, {params: params}).then(function(res) {
      return res.data.data;
    });
  },
};
