var React = require('react');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
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
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('Log In')}</Modal.Title>
        </Modal.Header>

        <Modal.Footer>
          <span>
            <a className="btn btn-info" onClick={this.props.onHide}>
              <i className="fa fa-close"></i> {i18n.t('Close')}
            </a>
          </span>

          <form action="/auth/ubuntu" method="post" className="login-modal-footer">
            <button type="submit" className="btn btn-warning">
              <i className="fa fa-linux"></i> {i18n.t('Log in via Ubuntu')}
            </button>
          </form>
        </Modal.Footer>
      </Modal>
    );
  }
});
