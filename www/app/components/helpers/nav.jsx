var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router');
var debounce = require('debounce');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var DocumentMeta = require('react-document-meta');
var i18n = require('i18next-client');

var actions = require('../../actions');
var info = require('../../info');
var Donate = require('../modals/donate');
var If = require('./if');

module.exports = React.createClass({
  displayName: 'Nav',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    loading: ['loading'],
    modals: ['modals'],
    location: ['location'],
    og: ['og'],
    lng: ['lng'],
    showSearch: ['showSearch'],
  },
  props: {
    location: React.PropTypes.object.isRequired,
  },

  componentWillMount: function() {
    this.debounceSearch = debounce(this.search, 300);

    if (this.props.location.pathname != '/wishlist' && this.props.location && this.props.location.query && this.props.location.query.q) {
      this.setState({search: this.props.location.query.q});
      actions.showSearch(true);
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (
      nextProps.location.pathname != '/wishlist' &&
      nextProps.location &&
      nextProps.location.query &&
      (nextState.search != nextProps.location.query.q) &&
      (this.props.location.query.q != nextProps.location.query.q) //Check that it actually changed
    ) {
      this.setState({search: nextProps.location.query.q});
    }
  },

  getInitialState: function() {
    return {
      search: '',
    };
  },

  logout: function() {
    actions.logout();
  },

  toggleSearch: function() {
    if (this.state.showSearch) {
      actions.showSearch(false);
      this.setState({search: ''});
    }
    else {
      actions.showSearch(true);

      var self = this;
      setTimeout(function() {
        var search = ReactDOM.findDOMNode(self.refs.search);
        var searchxs = ReactDOM.findDOMNode(self.refs.searchxs);
        if (search.offsetParent !== null) { //determine if search box is visible
          search.focus();
        }
        else {
          searchxs.focus();
        }
      }, 300);
    }
  },

  searchWrap: function(event) {
    this.setState({search: event.target.value});
    this.debounceSearch(event.target.value);
  },

  search: function(search) {
    if (search) {
      this.props.location.query.q = search;
      if (!this.props.location.query.sort) {
        this.props.location.query.sort = 'relevance';
      }

      if (this.props.location.query.page) {
        delete this.props.location.query.page;
      }
    }
    else {
      delete this.props.location.query.q;
      delete this.props.location.query.page;
    }

    this.history.pushState(null, '/apps', this.props.location.query);
  },

  open: function(modal) {
    actions.openModal(modal);
  },

  close: function(modal) {
    actions.closeModal(modal);
  },

  setLanguage: function(lng) {
    actions.i18n(lng);
  },

  render: function() {
    var partialTranslation = 60; //Languages with more untranslated strings that this are partial translations
    var comingTranslation = 200; //Languages with more untranslated strings than this are "coming soon"

    var title = this.state.og.title ? this.state.og.title : '';
    if (title.indexOf('uApp Explorer') == -1) {
      title = 'uApp Explorer - ' + title;
    }

    var meta = {
      title: title,
      description: this.state.og.description,
      meta: {
        itemProp: {
          name: this.state.og.title,
          description: this.state.og.description,
          image: this.state.og.image,
        },
        name: {
          'twitter:card': 'summary',
          'twitter:site': '@uappexplorer',
          'twitter:title': this.state.og.title,
          'twitter:description': this.state.og.description,
          'twitter:image:src': this.state.og.image,
        },
        property: {
          'og:title': this.state.og.title,
          'og:type': 'website',
          'og:url': window.location.href,
          'og:image': this.state.og.image,
          'og:description': this.state.og.description,
          'og:site_name': 'uApp Explorer',
        }
      },
      auto: {
        ograph: true
      }
    };

    return (
      <nav className="navbar navbar-material-blue" role="navigation">
        <DocumentMeta {...meta} />

        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#main-menu">
              <i className="fa fa-ellipsis-v fa-inverse"></i>
            </button>

            <If value={this.state.auth.loggedin}>
              <Link to="/me" className="navbar-toggle clickable">
                <i className="fa fa-user fa-inverse"></i>
              </Link>
            </If>

            <If value={!this.state.auth.loggedin}>
              <Link to="/login" className="navbar-toggle">
                <i className="fa fa-user-plus fa-inverse"></i>
              </Link>
            </If>

            <button type="button" className="navbar-toggle" onClick={this.toggleSearch}>
              <i className="fa fa-search fa-inverse"></i>
            </button>

            <span className="navbar-brand">
              <Link to={this.state.location.previous} className="link clickable">
                <If value={window.location.pathname != '/'} element="span">
                  <i className="fa fa-chevron-left back"></i>
                </If>

                <img src="/img/logo.svg" className={this.state.loading ? 'logo rotate' : 'logo'} />

                <If value={this.state.showSearch} element="span">
                  <span className="hidden-xs">uApp Explorer</span>
                </If>

                <If value={!this.state.showSearch} element="span">
                  <span className="brand-text">
                  <span className="visible-xs-inline">uApp Explorer</span>
                  <span className="hidden-xs">uApp Explorer</span>
                </span>
                </If>
              </Link>
            </span>

            <If value={this.state.showSearch}>
              <div className="visible-xs">
                <div className="input-group search-box">
                  <input type="text" className="form-control" id="search" onChange={this.searchWrap} value={this.state.search} ref="search" />
                </div>
              </div>
            </If>
          </div>

          <div className="navbar-collapse collapse navbar-right" id="main-menu">
            <ul className="nav navbar-nav">
              <If value={this.state.showSearch} element="li">
                <div className="input-group hidden-xs search-box">
                  <input type="text" className="form-control" id="search" onChange={this.searchWrap} value={this.state.search} ref="searchxs" />
                </div>
              </If>

              <li className="hidden-xs">
                <a onClick={this.toggleSearch} className="clickable"><i className="fa fa-search fa-inverse"></i></a>
              </li>
              <li>
                <Link to="/faq">{i18n.t('FAQ')}</Link>
              </li>
              <li>
                <a onClick={this.open.bind(this, 'donate')} className="clickable">{i18n.t('Donate')}</a>
              </li>
              <li>
                <Link to="/wishlist">{i18n.t('Wishlist')}</Link>
              </li>

              <If value={this.state.auth.loggedin} element="li">
                <Link to="/me" className="clickable hidden-xs">{i18n.t('My Lists')}</Link>
              </If>

              <If value={this.state.auth.loggedin} element="li">
                <a onClick={this.logout} className="clickable">{i18n.t('Log Out')}</a>
              </If>

              <If value={!this.state.auth.loggedin} element="li">
                <Link to="/login" className="hidden-xs">{i18n.t('Log In')}</Link>
              </If>

              <li>
                <a className="dropdown-toggle" data-toggle="dropdown" role="button">
                  {i18n.t('Language')} <span className="caret"></span>
                </a>
                <ul className="dropdown-menu">
                  <li className={(this.state.lng == 'en_US') ? 'active' : ''}>
                    <a onClick={this.setLanguage.bind(this, 'en_US')} className="clickable">English (US)</a>
                  </li>

                  {info.languages.map(function(lng) {
                    if (lng.untranslated < comingTranslation) {
                      var name = lng.name;
                      if (lng.untranslated > partialTranslation) {
                        name = lng.name + ' (Partial)';
                      }

                      return (
                        <li className={(this.state.lng == lng.code) ? 'active' : ''} key={lng.code}>
                          <a onClick={this.setLanguage.bind(this, lng.code)} className="clickable">
                            {name}
                          </a>
                        </li>
                      );
                    }
                  }, this)}

                  {info.languages.map(function(lng) {
                    if (lng.untranslated >= comingTranslation) {
                      var url = 'https://translations.launchpad.net/uappexplorer/trunk/+pots/uappexplorer/' + lng.code + '/+translate';
                      return (
                        <li className={(this.state.lng == lng.code) ? 'active' : ''} key={lng.code}>
                          <a href={url} className="clickable" target="_blank">
                            {lng.name} (Coming soon!)
                          </a>
                        </li>
                      );
                    }
                  }, this)}

                  <li>
                    <a href="https://translations.launchpad.net/uappexplorer" target="_blank">{i18n.t('Help translate!')}</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <Donate show={this.state.modals.donate} onHide={this.close.bind(this, 'donate')} />
      </nav>
    );
  }
});
