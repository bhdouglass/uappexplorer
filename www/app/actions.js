var moment = require('moment');
var i18n = require('i18next-client');
var cookie = require('cookie-cutter');

var tree = require('./state');
var api = require('./api');
var utils = require('./utils');

var actions = {};
actions = {
  getInfo: function() {
    if (!tree.get('info').loaded) {
      api.getInfo().then(function(data) {
        data.loaded = true;
        data.essentials.apps = utils.shuffle(data.essentials.apps);
        data.new_snaps.apps.forEach(function(snap) {
            snap.isSnap = true;
        });

        tree.set('info', data);
      });
    }
  },

  getApps: function(paging, no_set_last, set_loading) {
    set_loading = (set_loading === undefined) ? true : set_loading;

    var key = JSON.stringify(paging);
    var cached = tree.get('apps')[key];
    var now = moment();

    if (!no_set_last) {
      tree.set('lastPage', paging);
    }

    var promise = null;
    if (cached && now.diff(cached.fetched, 'minutes') <= 60) {
      promise = Promise.resolve(cached);
    }
    else {
      if (set_loading) {
        tree.set('loading', true);
      }

      promise = api.getApps(paging).then(function(data) {
        data.fetched = moment();

        tree.set(['apps', key], data);

        if (set_loading) {
          tree.set('loading', false);
        }

        tree.push('cache_keys', key);
        var cache_keys = tree.get('cache_keys');
        if (cache_keys.length > 10) {
          tree.unset(['apps', cache_keys[0]]);
          tree.splice('cache_keys', [0, 1]);
        }

        return data;
      }).catch(function() {
        tree.set('loading', false);
        actions.createAlert(i18n.t('Could not download app list, click to retry'), 'error', actions.getApps.bind(actions, paging));
      });
    }

    return promise;
  },

  previousApp: function(name) {
    var last_page = tree.get('lastPage');
    var key = JSON.stringify(last_page);

    tree.set('previousApp', null);
    return actions.getApps(last_page, true, false).then(function() {
      var apps = tree.get(['apps', key]);
      var last = null;

      //check for previous app on current page
      for (var i = 0; i < apps.apps.length; i++) {
        if (apps.apps[i].name == name) {
          break;
        }
        else {
          last = apps.apps[i];
        }
      }

      var value = null;
      if (last) { //previous app on current page
        value = last;
        tree.set('previousApp', last);
        tree.set('previousLastPage', null);
      }
      else {
        if (last_page.skip > 0) {
          //check for previous app on previous page
          last_page = JSON.parse(JSON.stringify(last_page));
          last_page.skip -= last_page.limit;
          last_page.skip = (last_page.skip > 0) ? last_page.skip : 0;

          tree.set('previousLastPage', last_page);

          var key2 = JSON.stringify(last_page);
          value = actions.getApps(last_page, true, false).then(function() {
            var apps2 = tree.get(['apps', key2]);

            if (apps2.apps.length > 0) {
              last = apps2.apps[(apps2.apps.length - 1)];
            }

            tree.set('previousApp', last);
            return last;
          });
        }
      }

      return value;
    });
  },

  nextApp: function(name) {
    var last_page = tree.get('lastPage');
    var key = JSON.stringify(last_page);

    tree.set('nextApp', null);
    return actions.getApps(last_page, true, false).then(function() {
      var apps = tree.get(['apps', key]);
      var next = null;

      //check for next app on current page
      for (var i = 0; i < apps.apps.length; i++) {
        if (apps.apps[i].name == name && (i + 1) < apps.apps.length) {
          next = apps.apps[(i + 1)];
        }
      }

      var value = null;
      if (next) { //next app on current page
        value = next;
        tree.set('nextApp', next);
        tree.set('nextLastPage', null);
      }
      else {
        //check for next app on next page
        last_page = JSON.parse(JSON.stringify(last_page));
        last_page.skip = last_page.skip + last_page.limit;

        tree.set('nextLastPage', last_page);

        var key2 = JSON.stringify(last_page);
        value = actions.getApps(last_page, true, false).then(function() {
          var apps2 = tree.get(['apps', key2]);

          if (apps2.apps.length > 0) {
            next = apps2.apps[0];
          }

          tree.set('nextApp', next);
          return next;
        });
      }

      return value;
    });
  },

  getSnaps: function(paging, no_set_last, set_loading) {
    set_loading = (set_loading === undefined) ? true : set_loading;

    var key = JSON.stringify(paging);
    var cached = tree.get('snaps')[key];
    var now = moment();

    if (!no_set_last) {
      tree.set('lastPage', paging);
    }

    var promise = null;
    if (cached && now.diff(cached.fetched, 'minutes') <= 60) {
      promise = Promise.resolve(cached);
    }
    else {
      if (set_loading) {
        tree.set('loading', true);
      }

      promise = api.getSnaps(paging).then(function(data) {
        data.fetched = moment();

        data.snaps.forEach(function(snap) {
          snap.isSnap = true;
        });
        tree.set(['snaps', key], data);

        if (set_loading) {
          tree.set('loading', false);
        }

        tree.push('cache_keys', key);
        var cache_keys = tree.get('cache_keys');
        if (cache_keys.length > 10) {
          tree.unset(['snaps', cache_keys[0]]);
          tree.splice('cache_keys', [0, 1]);
        }

        return data;
      }).catch(function(err) {
        console.log(err);
        tree.set('loading', false);
        actions.createAlert(i18n.t('Could not download snap list, click to retry'), 'error', actions.getSnaps.bind(actions, paging));
      });
    }

    return promise;
  },

  triggerPreviousApp: function() {
    if (tree.get('previousLastPage')) {
      tree.set('lastPage', tree.get('previousLastPage'));
      tree.set('previousLastPage', null);
    }
  },

  triggerNextApp: function() {
    if (tree.get('nextLastPage')) {
      tree.set('lastPage', tree.get('nextLastPage'));
      tree.set('nextLastPage', null);
    }
  },

  getFrameworks: function() {
    if (tree.get('frameworks').length === 0) {
      api.getFrameworks().then(function(data) {
        tree.set('frameworks', data);
      });
    }
  },

  getApp: function(name) {
    tree.set('loading', true);
    tree.set('app', {});
    tree.set('missingApp', null);

    api.getApp(name).then(function(data) {
      tree.set('loading', false);
      tree.set('app', data);
    }).catch(function(err) {
      tree.set('loading', false);
      if (err.status == 404) {
        tree.set('missingApp', name);
      }
      else {
        actions.createAlert(i18n.t('Could not download app data, click to retry'), 'error', actions.getApp.bind(actions, name));
      }
    });
  },

  getSnap: function(store, name) {
    tree.set('loading', true);
    tree.set('snap', {});
    tree.set('missingSnap', null);

    api.getSnap(store, name).then(function(data) {
      tree.set('loading', false);
      tree.set('snap', data);
    }).catch(function(err) {
      console.log(err);
      tree.set('loading', false);
      if (err.status == 404) {
        tree.set('missingSnap', name);
      }
      else {
        actions.createAlert(i18n.t('Could not download snap data, click to retry'), 'error', actions.getSnap.bind(actions, name));
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

        var list = reviews.reviews.map(function(review) {
          return review;
        });

        var ids = list.map(function(review) {
          return review.id;
        });

        for (var i = 0; i < data.reviews.length; i++) {
          if (ids.indexOf(data.reviews[i].id) == -1) {
            list.push(data.reviews[i]);
          }
        }

        tree.set('reviews', {
          reviews: list,
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

  requestApp: function(name) {
    return api.requestApp(name).then(function(app) {
      return app;
    }).catch(function() {
      return null;
    });
  },

  login: function() {
    return api.login().then(function(user) {
      tree.set('auth', {
        loggedin: true,
        user: user,
        authorization: btoa(user.apikey + ':' + user.apisecret),
      });

      actions.i18n(user.selectedLanguage);

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
      tree.set('savingSettings', false);
      actions.createAlert(i18n.t('Could not save your settings at this time, please try again later'));
    });
  },

  sendCaxton: function(url, message) {
    return api.sendCaxton(url, message).then(function() {
      return true;
    }).catch(function() {
      actions.createAlert(i18n.t('Could not connect to Caxton at this time, please try again later'), 'error');
      return false;
    });
  },

  saveLanguage: function(lng) {
    api.saveLanguage(lng).catch(function(err) {
      console.error(err);
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
      actions.createAlert(i18n.t('Could not load lists at this time, click to retry'), 'error', actions.getUserLists.bind(actions));
    });
  },

  getUserList: function(id) {
    tree.set('loading', true);
    return api.getUserList(id).then(function(list) {
      tree.set('userList', list);
      tree.set('loading', false);
    }).catch(function() {
      tree.set('loading', false);
      actions.createAlert(i18n.t('Could not find this list, it may not exist any more'), 'error');
    });
  },

  createUserList: function(list) {
    return api.createUserList(list).catch(function() {
      actions.createAlert(i18n.t('Could not create a new list at this time, please try again later'), 'error');
    });
  },

  updateUserList: function(id, list) {
    return api.updateUserList(id, list).catch(function() {
      actions.createAlert(i18n.t('Could not update the list at this time, please try again later'), 'error');
    });
  },

  deleteUserList: function(id) {
    return api.deleteUserList(id).catch(function() {
      actions.createAlert(i18n.t('Could not delete the list at this time, please try again later'), 'error');
    });
  },

  removeUserListApp: function(list, name) {
    var packages = [];
    var full_packages = [];
    for (var i = 0; i < list.packages.length; i++) {
      if (list.packages[i] != name) {
        packages.push(list.packages[i]);
      }

      if (list.full_packages[i] && list.full_packages[i].name != name) {
        full_packages.push(list.full_packages[i]);
      }
    }

    var newList = JSON.parse(JSON.stringify(list));
    newList.packages = packages;
    newList.full_packages = full_packages;

    tree.set('userList', newList);
    return api.removeUserListApp(list._id, name).catch(function() {
      actions.createAlert(i18n.t('Could not remove the app from this list, please try again later'), 'error');
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

    return api.addUserListApp(list._id, name).catch(function() {
      actions.createAlert(i18n.t('Could not add app to list at this time, please try again later'), 'error');
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
    tree.set('alert', {});
  },

  openModal: function(name) {
    tree.set(['modals', name], true);
  },

  closeModal: function(name) {
    tree.set(['modals', name], false);
  },

  showSearch: function(showSearch) {
    tree.set('showSearch', showSearch);
  },

  setLocation: function(location) {
    var current = tree.get(['location', 'current']);

    if (location.indexOf('/apps') === 0 || location.indexOf('/snaps') === 0) {
      actions.showSearch(true);
    }
    else {
      actions.showSearch(false);
    }

    if (location.indexOf('/app/') === 0 && current.indexOf('/app/') === 0) {
      //Don't log changes between apps, we always want to go back to the app list
      tree.set(['location', 'current'], location);
    }
    else if (location.indexOf('/app/') === 0 && current.indexOf('/apps') == -1 && current.indexOf('/list') == -1) {
      //Return to the app list if not already returning to the app list or a user list
      tree.set('location', {
        previous: '/apps',
        current: location,
      });
    }
    else if (location.indexOf('/list/') === 0) {
      //Return to the apps page from a list
      tree.set('location', {
        previous: '/apps',
        current: location,
      });
    }
    else if (location.indexOf('/apps') === 0) {
      //Return to the main page from the app list
      tree.set('location', {
        previous: '/',
        current: location,
      });
    }
    else if (location.indexOf('/snaps') === 0) {
      //Return to the main page from the snap list
      tree.set('location', {
        previous: '/',
        current: location,
      });
    }
    else if (location.indexOf('/snap/') === 0 && current.indexOf('/snaps') == -1 ) {
      //Return to the snap list from a snap page
      tree.set('location', {
        previous: '/snaps',
        current: location,
      });
    }
    else if (location.indexOf('/me') === 0) {
      //Return to the main page from the user page
      tree.set('location', {
        previous: '/',
        current: location,
      });
    }
    else {
      tree.set('location', {
        previous: current,
        current: location,
      });
    }
  },

  setOG: function(og) {
    var current = tree.get('og');
    if (og.title != current.title || og.description != current.description || og.image != current.image) {
      tree.set('og', og);
    }
  },

  i18n: function(lng) {
    lng = lng ? lng : 'en_US';
    lng = (lng == 'en') ? 'en_US' : lng;

    if (tree.get('lng') != lng) {
      i18n.init({
        //options: https://github.com/i18next/i18next/blob/master/i18next-latest.js#L315
        lng: lng,
        resGetPath: 'translations/__ns__-__lng__.json',
        showKeyIfEmpty: true,
        ns: {
          namespaces: ['uappexplorer'],
          defaultNs: 'uappexplorer'
        },
        fallbackLng: ['en_US'],
        nsseparator: '|',
        keyseparator: '^',
      }, function() {
        tree.set('lng', lng);

        if (tree.get(['auth', 'loggedin'])) {
          actions.saveLanguage(lng);
        }

        cookie.set('language', lng, {expires: 365});
      });
    }
  },
};

module.exports = actions;
