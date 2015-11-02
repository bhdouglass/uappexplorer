var axios = require('axios');

module.exports = {
  getCounts: function() {
    return axios.get('/api/apps/counts').then(function(res) {
      return res.data.data;
    });
  },

  getApps: function(params) {
    return axios.get('/api/apps', {params: params}).then(function(res) {
      return res.data.data;
    });
  },
};
