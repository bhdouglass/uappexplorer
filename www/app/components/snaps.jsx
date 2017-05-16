var React = require('react');
var Router = require('react-router');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var info = require('../info');
var AppList = require('./appinfo/appList');
var Pagination = require('./helpers/pagination');
var If = require('./helpers/if');

var DEFAULT_ARCH = 'any';
var DEFAULT_CATEGORY = 'all';
var DEFAULT_RELEASE = 'all';
var DEFAULT_LICENSE = 'any';
var DEFAULT_SORT = '-published_date';
var DEFAULT_TYPE = 'snappy';
var LIMIT = 30;

module.exports = React.createClass({
  displayName: 'Snaps',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    snaps: ['snaps'],
    loading: ['loading'],
    releases: ['releases'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      key: null,
      page: 0,
      filters: false,
      view: 'grid',
      search: '',
      architecture: DEFAULT_ARCH,
      category: DEFAULT_CATEGORY,
      release: DEFAULT_RELEASE,
      license: DEFAULT_LICENSE,
      sort: DEFAULT_SORT,
      type: DEFAULT_TYPE,
    };
  },

  getSnaps: function(props, state) {
    var params = props.location.query;

    var page = params.page ? parseInt(params.page) : 0;
    if (page < 0) {
      page = 0;
    }

    var arch = null;
    if (params.arch) {
      arch = [params.arch.toLowerCase()];

      if (params.arch.toLowerCase() != 'all') {
        arch.push('all');
      }
    }

    var license = null;
    if (params.license) {
      var licenses = info.licenses();
      for (var i = 0; i < licenses.length; i++) {
        if (licenses[i].value == params.license) {
          license = licenses[i].label;
        }
      }
    }

    //TODO filter by confinement
    var paging = {
      skip: page * LIMIT,
      limit: LIMIT,
      search: params.q ? params.q : null,
      sort: params.sort ? params.sort : DEFAULT_SORT,
      category: params.category ? params.category : null,
      architecture: arch ? arch.join(',') : null,
      release: params.release ? params.release : null,
      license: license,
      types: params.type ? params.type : null,
    };

    var cleanPaging = {};
    for (var key in paging) {
      if (paging[key] !== null) {
        cleanPaging[key] = paging[key];
      }
    }

    var sk = JSON.stringify(cleanPaging);
    if (state.key != sk) {
      var s = {
        key: sk,
        page: page,
        search: paging.search ? paging.search : '',
        architecture: arch ? arch[0] : DEFAULT_ARCH,
        category: paging.category ? paging.category : DEFAULT_CATEGORY,
        release: paging.release ? paging.release : DEFAULT_RELEASE,
        license: params.license ? params.license : DEFAULT_LICENSE,
        sort: paging.sort ? paging.sort : DEFAULT_SORT,
        type: paging.types ? paging.types : DEFAULT_TYPE,
      };

      if (
        s.architecture != DEFAULT_ARCH ||
        s.license != DEFAULT_LICENSE ||
        s.release != DEFAULT_RELEASE
      ) {
        s.filters = true;
      }

      this.setState(s);

      actions.getSnaps(cleanPaging).then(function() {
        window.scrollTo(0, 0);
      });
    }
  },

  componentWillMount: function() {
    actions.getReleases();
    this.getSnaps(this.props, this.state);

    actions.setOG({
      title: 'uApp Explorer',
      description: 'Browse and discover apps for Ubuntu Touch',
      image: 'https://uappexplorer.com/img/logo.png',
    });
  },

  componentWillUpdate: function(nextProps, nextState) {
    this.getSnaps(nextProps, nextState);
  },

  changeView: function(view) {
    this.setState({view: view});
  },

  toggleFilters: function() {
    this.setState({filters: !this.state.filters});
  },

  changeCategory: function(event) {
    if (event.target.value == DEFAULT_CATEGORY) {
      delete this.props.location.query.category;
    }
    else {
      this.props.location.query.category = event.target.value;
    }

    if (event.target.value != this.state.category && this.state.page) {
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/snaps', this.props.location.query);
  },

  changeType: function(event) {
    if (event.target.value == DEFAULT_TYPE) {
      delete this.props.location.query.type;
    }
    else {
      this.props.location.query.type = event.target.value;
    }

    if (event.target.value != this.state.type && this.state.page) {
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/snaps', this.props.location.query);
  },

  changeSort: function(event) {
    if (event.target.value == DEFAULT_SORT) {
      delete this.props.location.query.sort;
    }
    else {
      this.props.location.query.sort = event.target.value;
    }

    if (event.target.value != this.state.sort && this.state.page) {
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/snaps', this.props.location.query);
  },

  changeLicense: function(event) {
    if (event.target.value == DEFAULT_LICENSE) {
      delete this.props.location.query.license;
    }
    else {
      this.props.location.query.license = event.target.value;
    }

    if (event.target.value != this.state.license && this.state.page) {
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/snaps', this.props.location.query);
  },

  changeArcitecture: function(event) {
    if (event.target.value == DEFAULT_ARCH) {
      delete this.props.location.query.arch;
    }
    else {
      this.props.location.query.arch = event.target.value;
    }

    if (event.target.value != this.state.arch && this.state.page) {
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/snaps', this.props.location.query);
  },

  changeRelease: function(event) {
    var value = event.target.value.toLowerCase();
    if (value == DEFAULT_RELEASE) {
      delete this.props.location.query.release;
    }
    else {
      this.props.location.query.release = value;
    }

    if (value != this.state.release && this.state.page) {
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/snaps', this.props.location.query);
  },

  render: function() {
    var count = 0;
    var pages = 0;
    var snaps = [];
    var category = i18n.t('All');
    var type = info.count_types().all;

    var categories = info.categories();
    for (var i = 0; i < categories.length; i++) {
      if (this.state.category == categories[i].internal_name) {
        category = categories[i].name;
      }
    }

    if (this.state.key && this.state.snaps && this.state.snaps[this.state.key]) {
      count = this.state.snaps[this.state.key].count;
      pages = Math.ceil(count / LIMIT);
      snaps = this.state.snaps[this.state.key].snaps;

      if (this.state.type) {
        type = info.count_types(count)[this.state.type];
      }
    }

    var search_hint = '';
    if (this.state.search) {
        if (this.state.search.indexOf('author:') === 0) {
            search_hint = i18n.t('Author') + ': ' + this.state.search.replace('author:', '').trim();
        }
        else {
            search_hint = i18n.t('Containing:') + ' "' + this.state.search + '"';
        }
    }

    return (
      <div className="apps">
        <div className="app-search">
          <div className="row">
            <div className="col-md-5">
              <h1>{category}</h1>
              <span>{count} {type}</span>
              <span>
                <br/>
                {search_hint}
              </span>
            </div>
            <div className="col-md-7">
              <div className="row">
                <form className="top-filters">
                  <fieldset>
                    <div className="form-group col-md-4">
                      <label htmlFor="category" className="control-label hidden-xs">{i18n.t('Category:')}</label>
                      <select id="category" className="form-control" value={this.state.category} onChange={this.changeCategory}>
                        {info.categories().map(function(category) {
                          return <option value={category.internal_name} key={category.internal_name}>{category.name}</option>;
                        }, this)}
                      </select>
                    </div>

                    <div className="form-group col-md-4">
                      <label htmlFor="type" className="control-label hidden-xs">{i18n.t('Type:')}</label>
                      <select id="type" className="form-control" value={this.state.type} onChange={this.changeType}>
                        {info.snap_types().map(function(type) {
                          return <option value={type.value} key={type.value}>{type.label}</option>;
                        }, this)}
                      </select>
                    </div>

                    <div className="form-group col-md-4">
                      <label htmlFor="sort" className="control-label hidden-xs">{i18n.t('Sort By:')}</label>
                      <select id="sort" className="form-control" value={this.state.sort} onChange={this.changeSort}>
                        {info.snap_sorts().map(function(sort) {
                          return <option value={sort.value} key={sort.value}>{sort.label}</option>;
                        }, this)}
                      </select>
                    </div>
                  </fieldset>
                </form>
              </div>

              <div className="row">
                <div className="btn-toolbar pull-right more-filters-btn">
                  <div className="btn-group">
                    <a className="btn btn-material-light-blue clickable" onClick={this.toggleFilters}>
                      <i className={this.state.filters ? 'fa fa-minus-circle' : 'fa fa-plus-circle'}></i> {i18n.t('Filters')}
                    </a>
                  </div>
                </div>

                <div className="btn-toolbar pull-right">
                  <div className="btn-group">
                    <a className={(this.state.view == 'grid') ? 'btn clickable bold btn-material-light-blue view-button' : 'btn clickable'} onClick={this.changeView.bind(this, 'grid')}>
                      <span className="hidden-xs">{i18n.t('Grid')}</span> <i className="fa fa-th-large"></i>
                    </a>
                    <a className={(this.state.view != 'grid') ? 'btn clickable bold btn-material-light-blue view-button' : 'btn clickable'} onClick={this.changeView.bind(this, 'list')}>
                      <span className="hidden-xs">{i18n.t('List')}</span> <i className="fa fa-list"></i>
                    </a>
                  </div>
                </div>
              </div>

              <If value={this.state.filters}>
                <div className="row">
                  <form>
                    <fieldset>
                      <div className="form-group col-md-4">
                        <label htmlFor="license" className="control-label">{i18n.t('License:')}</label>
                        <select id="license" className="form-control" value={this.state.license} onChange={this.changeLicense}>
                          {info.licenses().map(function(license) {
                            return <option value={license.value} key={license.value}>{license.label}</option>;
                          }, this)}
                        </select>
                      </div>

                      <div className="form-group col-md-4">
                        <label htmlFor="architecture" className="control-label">{i18n.t('Architecture:')}</label>
                        <select id="architecture" className="form-control" value={this.state.architecture} onChange={this.changeArcitecture}>
                          {info.architectures().map(function(architecture) {
                            return <option value={architecture.value} key={architecture.value}>{architecture.label}</option>;
                          }, this)}
                        </select>
                      </div>

                      <div className="form-group col-md-4">
                        <label htmlFor="release" className="control-label">{i18n.t('Release:')}</label>
                        <select id="release" className="form-control" value={this.state.release} onChange={this.changeRelease}>
                          <option value="all">{i18n.t('All Releases')}</option>
                          {this.state.releases.map(function(release) {
                            return <option value={release} key={release}>{release}</option>;
                          }, this)}
                        </select>
                      </div>
                    </fieldset>
                  </form>
                </div>
              </If>
            </div>
          </div>
        </div>

        <If value={this.state.loading}>
          <div className="row">
            <div className="col-md-12 text-center">
              <i className="fa fa-spinner fa-spin fa-4x"></i>
            </div>
          </div>
        </If>

        <If value={count === 0 && !this.state.loading}>
          <div className="row">
            <div className="col-md-12 text-center">
              No snaps found, try searching again.
            </div>
          </div>
        </If>

        <AppList apps={snaps} view={this.state.view} popularity={(this.state.sort == '-monthly_popularity' || this.state.sort == 'monthly_popularity')} />
        <Pagination active={this.state.page} total={pages} base={'/snaps'} query={this.props.location.query} />
      </div>
    );
  }
});
