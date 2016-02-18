var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

module.exports = React.createClass({
  displayName: 'Donate',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },

  render: function() {
    return (
      <div className="center">
        <div className="icon-large ubuntu-shape">
          <img src="/img/app-logo.png" alt={i18n.t('Log In')} />
        </div>
        <br/>

        <form action="/auth/ubuntu" method="post" className="login-modal-footer">
          <button type="submit" className="btn btn-warning">
            <i className="fa fa-linux"></i> {i18n.t('Log in via Ubuntu')}
          </button>
        </form>
        <br/>
      </div>
    );
  }
});
