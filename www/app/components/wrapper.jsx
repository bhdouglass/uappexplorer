var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var cookie = require('cookie-cutter');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var tree = require('../state');
var Nav = require('./helpers/nav');
var Alerts = require('./helpers/alerts');
var Disclaimer = require('./modals/disclaimer');

module.exports = React.createClass({
  displayName: 'Wrapper',
  mixins: [
    mixins.root,
    PureRenderMixin,
  ],
  props: {
    location: React.PropTypes.object.isRequired,
  },

  getInitialState: function() {
    return {
      disclaimer: false,
      lng: null,
    };
  },

  componentWillMount: function() {
    actions.i18n(cookie.get('language'));
    actions.login().then(function(auth) {
      if (auth.loggedin) {
        actions.getUserLists();
      }
    });

    var show = cookie.get('disclaimer');
    if (!show) {
      this.open('disclaimer');

      var now = new Date();
      cookie.set('disclaimer', Math.floor(now.getTime() / 1000), {expires: 365});
    }

    var self = this;
    tree.select('lng').on('update', function() {
      //Hacky, but avoids having _another_ wrapper component
      self.setState({lng: tree.get('lng')});
    });
  },

  open: function(modal) {
    if (modal == 'faq') {
      actions.openModal('faq');
    }
    else {
      this.setState({disclaimer: true});
    }
  },

  close: function() {
    this.setState({disclaimer: false});
  },

  render: function() {
    return (
      <div>
        <Nav location={this.props.location} />

        <div className="container">
          <Alerts />
        </div>

        <div className="container main">
          <div className="row">
            <div className="col-sm-12 text-center disclaimer">
              <a onClick={this.open.bind(this, 'faq')} className="clickable">{i18n.t('This is an unofficial app viewer for Ubuntu Touch apps.')}</a>
            </div>
          </div>

          {this.props.children}

          <div className="row text-center footer">
            <div className="col-sm-4">
              <Link to="/app/uappexplorer.bhdouglass">
                <i className="fa fa-fw fa-mobile"></i> {i18n.t('Web App')}
              </Link>

              <Link to="/app/uappexplorer-scope.bhdouglass">
                <i className="fa fa-fw fa-mobile"></i> {i18n.t('Scope')}
              </Link>

              <Link to="/app/uappexplorer-donate.bhdouglass" className="hidden-xs">
                <i className="fa fa-fw fa-mobile"></i> {i18n.t('Donation Web App')}
              </Link>
            </div>

            <div className="col-sm-4">
              <a href="https://twitter.com/uappexplorer" style={{display: 'inline-block !important'}}><i className="fa fa-fw fa-t"></i> Twitter</a>
              <a href="https://plus.google.com/+Uappexplorer-ubuntu" style={{display: 'inline-block !important'}}><i className="fa fa-fw fa-gp"></i> Google+</a>
            </div>
            <div className="col-sm-4">
              <a href="http://feeds.feedburner.com/UbuntuTouchNewApps">
                <i className="fa fa-fw fa-rss-square"></i> {i18n.t('New Apps')}
              </a>
              <a href="http://feeds.feedburner.com/uAppExplorerUpdatedApps">
                <i className="fa fa-fw fa-rss-square"></i> {i18n.t('Updated Apps')}
              </a>
            </div>
          </div>
        </div>

        <Disclaimer show={this.state.disclaimer} onHide={this.close} />
      </div>
    );
  }
});
