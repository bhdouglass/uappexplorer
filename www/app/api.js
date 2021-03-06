var axios = require('axios');

function success(res) {
  return res.data.data;
}

module.exports = {
  getInfo: function() {
    return axios.get('/api/info').then(success);
  },

  getApps: function(params) {
    return axios.get('/api/apps', {params: params}).then(success);
  },

  getSnaps: function(params) {
    return axios.get('/api/v1/snaps', {params: params}).then(success);
  },

  getFrameworks: function() {
    return axios.get('/api/frameworks').then(success);
  },

  getApp: function(name) {
    return axios.get('/api/apps/' + name).then(success);
  },

  getSnap: function(store, name) {
    return axios.get('/api/v1/snaps/' + store + '/' + name).then(success);
  },

  getReviews: function(name, params) {
    return axios.get('/api/apps/reviews/' + name, {params: params}).then(success);
  },

  requestApp: function(name) {
    return axios.get('/api/apps/find/' + name).then(success);
  },

  login: function() {
    return axios.get('/auth/me').then(success);
  },

  saveCaxton: function(caxton_token) {
    return axios.post('/auth/caxton/' + caxton_token).then(success);
  },

  sendCaxton: function(url, message) {
    return axios.post('/auth/caxton/send', {url: url, message: message}).then(success);
  },

  saveLanguage: function(lng) {
    return axios.post('/auth/language/' + lng).then(success);
  },

  getUserLists: function(user_id) {
    return axios.get('/api/lists', {params: {user: user_id, sort: 'name'}}).then(success);
  },

  getUserList: function(id) {
    return axios.get('/api/lists/' + id).then(success);
  },

  createUserList: function(list) {
    return axios.post('/api/lists', list).then(success);
  },

  updateUserList: function(id, list) {
    return axios.put('/api/lists/' + id, list).then(success);
  },

  addUserListApp: function(id, app) {
    return axios.put('/api/lists/' + id, {append_package: app}).then(success);
  },

  removeUserListApp: function(id, app) {
    return axios.put('/api/lists/' + id, {remove_package: app}).then(success);
  },

  deleteUserList: function(id) {
    return axios.delete('/api/lists/' + id).then(success);
  },
};
