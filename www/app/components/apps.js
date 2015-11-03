var React = require('react');
var mixins = require('baobab-react/mixins');
var actions = require('../actions');
var AppList = require('./appinfo/appList');
var Pagination = require('./pagination');

var DEFAULT_SORT = '-published_date';
var DEFAULT_ARCH = 'all';
var LIMIT = 30;

module.exports = React.createClass({
  displayName: 'Apps',
  mixins: [
    mixins.branch
  ],
  cursors: {
    apps: ['apps'],
  },

  getInitialState: function() {
    return {
      key: null,
      paging: {
        page: 0,
        limit: LIMIT,
        search: null,
        sort: DEFAULT_SORT,
        query: {
          categories: null,
          architecture: null,
          framework: null,
          license: null,
          type: null,
        }
      }
    };
  },

  getApps: function(props, state) {
    var params = props.location.query;

    var page = params.page ? parseInt(params.page) : 0;
    var arch = null;
    if (params.arch) {
      arch = [params.arch];

      if (params.arch.toLowerCase() != DEFAULT_ARCH) {
        arch.push(DEFAULT_ARCH);
      }
    }

    var paging = {
      skip: page * LIMIT,
      limit: LIMIT,
      search: params.q ? params.q : null,
      sort: params.sort ? params.sort : DEFAULT_SORT,
      mini: true,
      query: {
        categories: params.category ? params.category : null,
        architecture: arch,
        framework: params.framework ? params.framework : null,
        license: params.license ? params.license : null,
        types: params.type ? params.type : null,
      }
    };

    var cleanPaging = {};
    for (var key in paging) {
      if (paging[key] !== null) {
        cleanPaging[key] = paging[key];
      }
    }

    cleanPaging.query = {};
    if (paging.query) {
      for (var subkey in paging.query) {
        if (paging.query[subkey] !== null) {
          cleanPaging.query[subkey] = paging.query[subkey];
        }
      }
    }

    var sk = JSON.stringify(cleanPaging);
    if (state.key != sk) {
      console.log('fetching apps', sk);
      this.setState({
        paging: paging,
        key: sk,
        page: page,
      });

      actions.getApps(cleanPaging);
    }
  },

  componentWillMount: function() {
    this.getApps(this.props, this.state);
  },

  componentWillUpdate: function(nextProps, nextState) {
    this.getApps(nextProps, nextState);
  },

  render: function() {
    var count = 0;
    var pages = 0;
    var apps = [];
    if (this.state.key && this.state.apps && this.state.apps[this.state.key]) {
      count = this.state.apps[this.state.key].count;
      pages = Math.ceil(count / this.state.paging.limit);
      apps = this.state.apps[this.state.key].apps;
    }

    //TODO filters/search
    return (
      <div>
        <AppList apps={apps} view="grid" />
        <Pagination active={this.state.page} total={pages} base={'/apps'} query={this.props.location.query} />
      </div>
    );
  }
});
