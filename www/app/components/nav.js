var React = require('react');
var mixins = require('baobab-react/mixins');

module.exports = React.createClass({
  displayName: 'Nav',
  mixins: [
    mixins.branch
  ],
  cursors: {
    auth: ['auth'],
    search: ['search'],
    loading: ['loading'],
  },

  login: function() {
    //TODO
  },

  logout: function() {
    //TODO
  },

  toggleSearch: function() {
    //TODO
  },

  showFAQ: function() {
    //TODO
  },

  showDonate: function() {
    //TODO
  },

  renderLoginButton: function() {
    var button = '';
    if (this.state.auth.loggedin) {
      button = (
        <a href="/me" className="navbar-toggle clickable">
          <i className="fa fa-user fa-inverse"></i>
        </a>
      );
    }
    else {
      button = (
        <a className="navbar-toggle clickable" onClick={this.login}>
          <i className="fa fa-user-plus fa-inverse"></i>
        </a>
      );
    }

    return button;
  },

  renderLoginList: function() {
    var list = '';
    if (this.state.auth.loggedin) {
      //TODO remove span
      list = (
        <span>
          <li className="hidden-xs">
            <a href="/me" className="clickable">My Lists</a>
          </li>
          <li>
            <a onClick={this.logout} className="clickable">Log Out</a>
          </li>
        </span>
      );
    }
    else {
      list = (
        <li className="hidden-xs">
          <a onClick={this.login} className="clickable">Log In</a>
        </li>
      );
    }

    return list;
  },

  renderBackButton: function() {
    var link = '/'; //TODO proper logic
    var cls = 'logo';
    if (this.state.loading) {
      cls = 'logo rotate';
    }

    var icon = '';
    if (false) { //TODO
      icon = <i className="fa fa-chevron-left"></i>;
    }

    var brand = <span className="hidden-xs">uApp Explorer</span>;
    if (!this.state.search.show) {
      brand = (
        <span className="brand-text">
          <span className="visible-xs-inline">uApp Explorer</span>
          <span className="hidden-xs">uApp Explorer</span>
        </span>
      );
    }

    return (
      <span className="navbar-brand">
        <a href={link} className="link clickable">
          {icon}
          <img src="/img/logo.svg" className={cls} />
          {brand}
        </a>
      </span>
    );
  },

  renderSearch: function() {
    var search = '';
    if (this.state.search.show) { //TODO onChange
      search = (
        <div className="visible-xs">
          <div className="input-group search-box">
            <input type="text" className="form-control" id="search" />
          </div>
        </div>
      );
    }

    return search;
  },

  renderSearchXS: function() {
    var search = '';
    if (this.state.search.show) { //TODO onChange
      search = (
        <li>
          <div className="input-group hidden-xs search-box">
            <input type="text" className="form-control" id="search" />
          </div>
        </li>
      );
    }

    return search;
  },

  renderLanguageList: function() {
    //TODO
    /*
    <li>
      <a className="dropdown-toggle" data-toggle="dropdown" role="button">
        <span translate>Language</span> <span className="caret"></span>
      </a>
      <ul className="dropdown-menu">
        <li ng-className="{active: language == 'en'}">
          <a ng-click="setLanguage('en')" className="clickable">English (US)</a>
        </li>

        <li ng-repeat="lang in languages | maths:'untranslated':'lt':comingTranslation" ng-className="{'active': language == lang.code}">
          <a ng-click="setLanguage(lang.code)" className="clickable">
            <span ng-bind="lang.name"></span>
            <span ng-if="lang.untranslated > partialTranslation">(Partial)</span>
          </a>
        </li>

        <li ng-repeat="lang in languages | maths:'untranslated':'gte':comingTranslation" ng-className="{'active': language == lang.code}">
          <a ng-href="https://translations.launchpad.net/uappexplorer/trunk/+pots/uappexplorer/{{lang.code}}/+translate" className="clickable" target="_blank">
            <span ng-bind="lang.name"></span> (Coming soon!)
          </a>
        </li>

        <li>
          <a href="https://translations.launchpad.net/uappexplorer" target="_blank" translate>Help translate!</a>
        </li>
      </ul>
    </li>
    */

    return '';
  },

  render: function() {
    return (
      <nav className="navbar navbar-material-blue" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#main-menu">
              <i className="fa fa-ellipsis-v fa-inverse"></i>
            </button>

            {this.renderLoginButton()}

            <button type="button" className="navbar-toggle" onClick={this.toggleSearch}>
              <i className="fa fa-search fa-inverse"></i>
            </button>

            {this.renderBackButton()}
            {this.renderSearch()}
          </div>

          <div className="navbar-collapse collapse navbar-right" id="main-menu">
            <ul className="nav navbar-nav">
              {this.renderSearchXS()}

              <li className="hidden-xs">
                <a onClick={this.toggleSearch} className="clickable"><i className="fa fa-search fa-inverse"></i></a>
              </li>
              <li>
                <a onClick={this.showFAQ} className="clickable">FAQ</a>
              </li>
              <li>
                <a onClick={this.showDonate} className="clickable" translate>Donate</a>
              </li>

              {this.renderLoginList()}
              {this.renderLanguageList()}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});
