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

  login: function() {
    return axios.get('/auth/me').then(function(res) {
      return res.data.data;
    });
  },

  saveCaxton: function(caxton_token) {
    return axios.post('/auth/caxton/' + caxton_token).then(function(res) {
      return res.data.data;
    });
  },

  getUserLists: function(user_id) {
    return axios.get('/api/lists', {params: {user: user_id, sort: 'name'}}).then(function(res) {
      return res.data.data;
    });
  },

  getUserList: function(id) {
    return axios.get('/api/lists/' + id).then(function(res) {
      return res.data.data;
    });
  },

  createUserList: function(list) {
    return axios.post('/api/lists', list).then(function(res) {
      return res.data.data;
    });
  },

  updateUserList: function(id, list) {
    return axios.put('/api/lists/' + id, list).then(function(res) {
      return res.data.data;
    });
  },

  deleteUserList: function(id) {
    return axios.delete('/api/lists/' + id).then(function(res) {
      return res.data.data;
    });
  },
};
