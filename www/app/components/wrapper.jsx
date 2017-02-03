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
var If = require('./helpers/if');

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
      lng: null,
      textDisclaimer: false,
    };
  },

  componentWillMount: function() {
    actions.i18n(cookie.get('language'));
    actions.login().then(function(auth) {
      if (auth.loggedin) {
        actions.getUserLists();
      }
    });

    this.setState({textDisclaimer: this.props.location.pathname});

    var self = this;
    tree.select('lng').on('update', function() {
      //Hacky, but avoids having _another_ wrapper component
      self.setState({lng: tree.get('lng')});
    });
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (nextState.textDisclaimer !== false && nextState.textDisclaimer != nextProps.location.pathname) {
      this.setState({textDisclaimer: false});
    }
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
              <Link to="/faq">
                <If value={this.state.textDisclaimer}>
                  {i18n.t('uApp Explorer is the unofficial viewer for snaps and Ubuntu Touch apps.')}
                </If>
              </Link>
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
              <Link to="/feeds">
                <i className="fa fa-fw fa-rss-square"></i> {i18n.t('RSS Feeds')}
              </Link>

              <a href="http://status.uappexplorer.com/"><i className="fa fa-info-circle"></i> {i18n.t('Status')}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
