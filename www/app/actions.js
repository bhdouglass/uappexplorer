var tree = require('./state');
var api = require('./api');

var actions = {};
actions = {
  getCounts: function() {
    if (!tree.get('counts').loaded) {
      tree.set('loading', true);
      api.getCounts().then(function(data) {
        data.loaded = true;
        tree.set('counts', data);
        tree.set('loading', false);
      }).catch(function() {
        tree.set('loading', false);
      });
    }
  },

  getEssentials: function() {
    if (!tree.get('essentials').loaded) {
      api.getEssentials().then(function(data) {
        tree.set('essentials', {
          loaded: true,
          apps: data,
        });
      });
    }
  },

  getTopApps: function() {
    if (tree.get('top').length === 0) {
      tree.set('loading', true);
      api.getApps({sort: '-points', limit: 12}).then(function(data) {
        tree.set('top', data.apps);
        tree.set('loading', false);
      }).catch(function() {
        tree.set('loading', false);
      });
    }
  },

  getNewApps: function() {
    if (tree.get('new').length === 0) {
      tree.set('loading', true);
      api.getApps({sort: '-published_date', limit: 6}).then(function(data) {
        tree.set('new', data.apps);
        tree.set('loading', false);
      }).catch(function() {
        tree.set('loading', false);
      });
    }
  },

  getApps: function(paging) {
    //TODO caching

    tree.set('loading', true);
    return api.getApps(paging).then(function(data) {
      tree.set(['apps', JSON.stringify(paging)], data);
      tree.set('loading', false);
      return data;
    }).catch(function() {
      tree.set('loading', false);
      actions.createAlert('Could not download app list, click to retry', 'error', actions.getApps.bind(actions, paging));
    });
  },

  getFrameworks: function() {
    if (tree.get('frameworks').length === 0) {
      api.getFrameworks().then(function(data) {
        data.unshift('All');
        tree.set('frameworks', data);
      });
    }
  },

  getApp: function(name) {
    tree.set('loading', true);
    tree.set('app', {});

    api.getApp(name).then(function(data) {
      tree.set('loading', false);
      tree.set('app', data);
    }).catch(function(err) {
      tree.set('loading', false);
      if (err.status == 404) {
        actions.createAlert('Could not find app', 'error', function() {
          window.location.pathname = '/apps';
        });
      }
      else {
        actions.createAlert('Could not download app data, click to retry', 'error', actions.getApp.bind(actions, name));
      }
    });
  },

  getReviews: function(name, params) {
    if (name != tree.get('reviews').name) {
      tree.set('reviews', {loaded: false});
    }

    api.getReviews(name, params).then(function(data) {
      data.loaded = true;
      data.params = params;

      if (data.name == tree.get('reviews').name) {
        var reviews = tree.get('reviews');

        tree.set('reviews', {
          reviews: reviews.reviews.concat(data.reviews),
          more: data.more,
          params: params,
          name: data.name,
          loaded: true,
          stats: data.stats,
        });
      }
      else {
        tree.set('reviews', data);
      }
    });
  },

  login: function() {
    return api.login().then(function(user) {
      tree.set('auth', {
        loggedin: true,
        user: user,
        authorization: btoa(user.apikey + ':' + user.apisecret),
      });

      return tree.get('auth');
    }).catch(function() {
      tree.set('auth', {
        loggedin: false,
        user: null,
        authorization: null,
      });

      return tree.get('auth');
    });
  },

  logout: function() {
    tree.set('auth', {
      loggedin: false,
      user: null,
      authorization: null,
    });

    window.location.href = '/auth/logout';
  },

  saveSettings: function(settings) {
    tree.set('savingSettings', true);

    api.saveCaxton(settings.caxton).then(function() {
      tree.set('savingSettings', false);
      tree.set(['auth', 'has_caxton'], !!settings.caxton);
    }).catch(function() {
      actions.createAlert('Could not save your settings at this time, please try again later');
    });
  },

  sendCaxton: function(url, message) {
    return api.sendCaxton(url, message).then(function() {
      return true;
    }).catch(function() {
      actions.createAlert('Could not connect to Caxton at this time, please try again later', 'error');
      return false;
    });
  },

  getUserLists: function() {
    tree.set('userLists', {
      loaded: false,
      lists: [],
    });

    api.getUserLists(tree.get('auth').user._id).then(function(lists) {
      tree.set('userLists', {
        loaded: true,
        lists: lists,
      });
    }).catch(function() {
      actions.createAlert('Could not load lists at this time, click to retry', 'error', actions.getUserLists.bind(actions));
    });
  },

  getUserList: function(id) {
    tree.set('loading', true);
    return api.getUserList(id).then(function(list) {
      tree.set('userList', list);
      tree.set('loading', false);
    }).catch(function() {
      tree.set('loading', false);
      actions.createAlert('Could not find this list, it may not exist any more', 'error');
    });
  },

  createUserList: function(list) {
    return api.createUserList(list).catch(function() {
      actions.createAlert('Could not create a new list at this time, please try again later', 'error');
    });
  },

  updateUserList: function(id, list) {
    return api.updateUserList(id, list).catch(function() {
      actions.createAlert('Could not update the list at this time, please try again later', 'error');
    });
  },

  deleteUserList: function(id) {
    return api.deleteUserList(id).catch(function() {
      actions.createAlert('Could not delete the list at this time, please try again later', 'error');
    });
  },

  removeUserListApp: function(list, name) {
    var packages = [];
    var full_packages = [];
    for (var i = 0; i < list.packages.length; i++) {
      if (list.packages[i] != name) {
        packages.push(list.packages[i]);
      }

      if (list.full_packages[i].name != name) {
        full_packages.push(list.full_packages[i]);
      }
    }

    var newList = JSON.parse(JSON.stringify(list));
    newList.packages = packages;
    newList.full_packages = full_packages;

    tree.set('userList', newList);
    return this.updateUserList(list._id, newList).catch(function() {
      actions.createAlert('Could not remove the app from this list, please try again later', 'error');
    });
  },

  addUserListApp: function(list, name) {
    var newList = JSON.parse(JSON.stringify(list));
    newList.packages.push(name);

    var newUserLists = [];
    var userLists = tree.get('userLists');
    for (var i = 0; i < userLists.lists.length; i++) {
      if (newList._id == userLists.lists[i]._id) {
        newUserLists.push(newList);
      }
      else {
        newUserLists.push(userLists.lists[i]);
      }
    }

    tree.set(['userLists', 'lists'], newUserLists);

    return this.updateUserList(list._id, newList).catch(function() {
      actions.createAlert('Could not add app to list at this time, please try again later', 'error');
    });
  },

  createAlert: function(text, type, callback) {
    tree.set('alert', {
      text: text,
      type: type ? type : 'error',
      callback: callback ? callback : null,
    });
  },

  clearAlert: function() {
    tree.set('alert', null);
  },

  openModal: function(name) {
    tree.set(['modals', name], true);
  },

  closeModal: function(name) {
    tree.set(['modals', name], false);
  },
};

module.exports = actions;
