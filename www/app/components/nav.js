var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router');
var debounce = require('debounce');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');

module.exports = React.createClass({
  displayName: 'Nav',
  mixins: [
    mixins.branch,
    Router.History,
  ],
  cursors: {
    auth: ['auth'],
    loading: ['loading'],
  },

  props: {
    location: React.PropTypes.object.isRequired,
  },

  componentWillMount: function() {
    var search = {
      show: false,
      term: '',
    };

    if (this.props.location && this.props.location.query && this.props.location.query.q) {
      search.show = true;
      search.term = this.props.location.query.q;
    }

    this.setState({search: search});
  },

  componentWillUpdate: function(nextProps) {
    if (nextProps.location && nextProps.location.query && (this.state.search.term != nextProps.location.query.q)) {
      this.setState({search: {
        show: this.state.search.show,
        term: nextProps.location.query.q,
      }});
    }
  },

  getInitialState: function() {
    return {
      login: false,
      faq: false,
      donate: false,
      search: {
        show: false,
        term: '',
      },
    };
  },

  logout: function() {
    //TODO
  },

  toggleSearch: function() {
    if (this.state.search.show) {
      this.setState({search: {
        show: false,
        term: '',
      }});
    }
    else {
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

      this.setState({search: {
        show: true,
        term: this.state.search.term,
      }});
    }
  },

  search: function(event) {
    if (event.target.value) {
      this.props.location.query.q = event.target.value;
    }
    else {
      delete this.props.location.query.q;
    }

    this.history.pushState(null, '/apps', this.props.location.query);
  },

  open: function(modal) {
    var state = {};
    state[modal] = true;
    this.setState(state);
  },

  close: function(modal) {
    var state = {};
    state[modal] = false;
    this.setState(state);
  },

  renderFAQModal: function() {
    return (
      <Modal show={this.state.faq} onHide={this.close.bind(this, 'faq')}>
        <Modal.Header closeButton>
          <Modal.Title>FAQ</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h4>What is this site?</h4>
          <div>
This site is an unofficial app browser for Ubuntu Touch apps. All data for the
apps comes from a publicly accessible api. This site is maintained by Brian
Douglass and is not endorsed by or affiliated with Ubuntu or Canonical. Ubuntu
and Canonical are registered trademarks of Canonical Ltd.
            <br/>
            <br/>
            <a href="https://wiki.ubuntu.com/AppStore/Interfaces/ClickPackageIndex">
              API <i className="fa fa-external-link"></i>
            </a>
            <br/>
            <a href="http://www.canonical.com/">
              Canonical Ltd. <i className="fa fa-external-link"></i>
            </a>
          </div>
          <br/>

          <h4>How do I install apps?</h4>
          <div>
            <p>
To install an app, visit this site on your Ubuntu Touch device. Find the app
that you wish to install and click the "Install" button. You will then be
taken to the official appstore on your device where you can install the app.
            </p>
            <p>Apps are not installed via this site, but via the official appstore.</p>
          </div>
          <br/>

          <h4>What is the star rating?</h4>
          <div>
The star rating is the Bayesian average of the star ratings that user give
to an app when they leave a review. The Bayesian average allows apps with
more reviews to rank better than apps with less reviews. The star rating
can be between 1 and 5, where a 0 means that there have not been any reviews
yet. For more information about the Bayesian average calculation, check out
this article.
            <br/>
            <br/>
            <a href="http://fulmicoton.com/posts/bayesian_rating/">
              Article <i className="fa fa-external-link"></i>
            </a>
          </div>
          <br/>

          <h4>What is the heart rating?</h4>
          <div>
            <p>
The heart rating is similar to the star rating, but it rewards apps for having
more good reviews. An app with more 5 star ratings will have a higher heart
rating than an app with only a few 5 star ratings.
            </p>
            <p>
Heart ratings are calculated from the star rating where a 5 star review is
1 heart point, 4 stars = 0.5 hearts, 3 stars = 0 hearts, 2 stars = -0.5 hearts,
and 1 star = -1 hearts.
            </p>
            <p>It is possible to have a negative heart rating.</p>
          </div>
          <br/>

          <h4>How is the popularity determined?</h4>
          <div>
            <p>
Popularity is based on the number of 4 and 5 star reviews given to and app
during the current month.
            </p>
          </div>
          <br/>

          <h4>I just published my app, why don't I see it?</h4>
          <div>
            <a href="/apps/request" onClick={this.close.bind(this, 'faq')}>
New apps are fetched from the official appstore every hour, you can either
wait until the new apps are fetched or use the request form to request that the
app be found early.
            </a>
          </div>

          <h4>What do I do if I find copyright or trademark infringing content?</h4>
          <div>
Any requests to remove copyright or trademark infringing content should be
taken up with <a href="http://www.canonical.com/">Canonical</a> or the app's
author (an author usually has a method of contact listed under the "Support"
tab on their app's page). uApp Explorer is not affiliated with Canonical
and does not host any apps. uApp Explorer only displays publicly available
information about the official Ubuntu Touch appstore.
          </div>

          <h4>Where can I report a problem or request a new feature?</h4>
          <div>
            <a href="https://github.com/bhdouglass/uappexplorer/issues">
              To report a problem or request a new feature visit the issues page for this site on GitHub.
            </a>
          </div>
          <br/>

          <h4>How can I help improve this site?</h4>
          <div>
            <a href="https://github.com/bhdouglass/uappexplorer">
              If you want to contribute code visit the GitHub repo.
            </a>
            <br/>
            <a href="https://github.com/bhdouglass/uappexplorer/issues">
              If you want to submit bugs or feature requests visit the GitHub issues page.
            </a>
            <br/>
            <a href="https://translations.launchpad.net/uappexplorer">
              If you want to help translate, visit the Launchpad project.
            </a>
            <br/>
            <a onClick={this.close.bind(this, 'faq')} className="clickable">
              If you would like to contribute monetarily, there are multiple options for donating.
            </a>
            <br/>
            <a href="http://bhdouglass.com/">
              If you would like to contact the author, visit his website.
            </a>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-info" onClick={this.close.bind(this, 'faq')}>Close</button>
        </Modal.Footer>
      </Modal>
    );
    //TODO clicking donate button
  },

  renderDonateModal: function() {
    return (
      <Modal show={this.state.donate} onHide={this.close.bind(this, 'donate')}>
        <Modal.Header closeButton>
          <Modal.Title>Donate</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h4>Why donate?</h4>
          <p>
Donating to uApp Explorer is just one way you can help make it better. If you
choose to donate, you money will go towards infrastructure costs. Costs include
domain names, hosting, etc. uApp Explorer will always be a free and open source
service, regardless of the number of donations.
          </p>
          <p>
            Whether you choose to donate or not, I still appreciate you support. Thank you!
            <br/>
            - Brian
          </p>

          <h4>Buy the Webapp</h4>
          <div>
            <a href="https://uappexplorer.com/app/uappexplorer-donate.bhdouglass" ng-click="$dismiss('close')">
              Buy the webapp from the Ubuntu Touch app store
            </a>
            <br/>
            <a href="https://uappexplorer.com/app/uappexplorer.bhdouglass" ng-click="$dismiss('close')">
              (Don't worry, there is a free version too!)
            </a>
          </div>

          <h4>Donate via Paypal</h4>
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----" />
            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="Donate via Paypal" />
          </form>

          <h4>Donate via Gratipay</h4>
          <div>
            <a href="https://gratipay.com/~bhdouglass/">
              <img src="//img.shields.io/gratipay/bhdouglass.svg" />
            </a>
          </div>

          <h4>Donate via Bitcoin</h4>
          <div>
            <i className="fa fa-btc"></i> 18QvvyHWxvXWDcH2Mf9McjQNrjDHuYKYtP
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-info" onClick={this.close.bind(this, 'donate')}>Thank you!</button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderLoginModal: function() {
    return (
      <Modal show={this.state.login} onHide={this.close.bind(this, 'login')}>
        <Modal.Header closeButton>
          <Modal.Title>Log In</Modal.Title>
        </Modal.Header>

        <Modal.Footer>
          <button className="btn btn-info" onClick={this.close.bind(this, 'login')}>
            <i className="fa fa-close"></i> Close
          </button>

          <form action="/auth/ubuntu" method="post" className="login-modal-footer">
            <button type="submit" className="btn btn-warning">
              <i className="fa fa-linux"></i> Log in via Ubuntu
            </button>
          </form>
        </Modal.Footer>
      </Modal>
    );
  },

  renderLoginButton: function() {
    var button = '';
    if (this.state.auth.loggedin) {
      button = (
        <Link to="/me" className="navbar-toggle clickable">
          <i className="fa fa-user fa-inverse"></i>
        </Link>
      );
    }
    else {
      button = (
        <a className="navbar-toggle clickable" onClick={this.open.bind(this, 'login')}>
          <i className="fa fa-user-plus fa-inverse"></i>
        </a>
      );
    }

    return button;
  },

  renderLoginList: function() {
    var list = '';
    if (this.state.auth.loggedin) {
      list = [
        (
          <li className="hidden-xs">
            <Link to="/me" className="clickable">My Lists</Link>
          </li>
        ), (
          <li>
            <a onClick={this.logout} className="clickable">Log Out</a>
          </li>
        )
      ];
    }
    else {
      list = (
        <li className="hidden-xs">
          <a onClick={this.open.bind(this, 'login')} className="clickable">Log In</a>
        </li>
      );
    }

    return list;
  },

  renderBackButton: function() {
    var link = '/'; //TODO proper logic and see if react router history can handle this
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
        <Link to={link} className="link clickable">
          {icon}
          <img src="/img/logo.svg" className={cls} />
          {brand}
        </Link>
      </span>
    );
  },

  renderSearch: function() {
    var search = '';
    if (this.state.search.show) {
      search = (
        <div className="visible-xs">
          <div className="input-group search-box">
            <input type="text" className="form-control" id="search" onChange={debounce(this.search, 300)} defaultValue={this.state.search.term} ref="search" />
          </div>
        </div>
      );
    }

    return search;
  },

  renderSearchXS: function() {
    var search = '';
    if (this.state.search.show) {
      search = (
        <li>
          <div className="input-group hidden-xs search-box">
            <input type="text" className="form-control" id="search" onChange={debounce(this.search, 300)} defaultValue={this.state.search.term} ref="searchxs" />
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
                <a onClick={this.open.bind(this, 'faq')} className="clickable">FAQ</a>
              </li>
              <li>
                <a onClick={this.open.bind(this, 'donate')} className="clickable">Donate</a>
              </li>

              {this.renderLoginList()}
              {this.renderLanguageList()}
            </ul>
          </div>
        </div>

        {this.renderFAQModal()}
        {this.renderDonateModal()}
        {this.renderLoginModal()}
      </nav>
    );
  }
});
