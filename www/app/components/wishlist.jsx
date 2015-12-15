var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var If = require('./helpers/if');
var WishEdit = require('./modals/wishEdit');

module.exports = React.createClass({
  displayName: 'Wishlist',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    wishes: ['wishes'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      show: false,
    };
  },

  componentWillMount: function() {
    actions.getWishes();
  },

  openModal: function() {
    this.setState({show: true});
  },

  closeModal: function(refresh) {
    this.setState({show: false});

    if (refresh) {
      actions.getWishes();
    }
  },

  render: function() {
    return (
      <div>
        <h1 className="text-center">{i18n.t('App Wishlist')}</h1>

        <div className="row">
          <div className="col-xs-12">
            <If value={this.state.auth.loggedin}>
            <div className="text-center">
              <a onClick={this.openModal} className="clickable btn btn-success">
                {i18n.t('Make a wish')}
              </a>

              <WishEdit show={this.state.show} onHide={this.closeModal} />
            </div>
            </If>

            <If value={!this.state.auth.loggedin}>
              <div className="text-center">
                <a onClick={actions.openModal.bind(this, 'login')} className="clickable btn btn-success">
                  {i18n.t('Login to make a wish')}
                </a>
              </div>
            </If>
          </div>
        </div>
      </div>
    );
  }
});
