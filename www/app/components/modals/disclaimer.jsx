var React = require('react');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

module.exports = React.createClass({
  displayName: 'Disclaimer',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('Welcome to uApp Explorer!')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {i18n.t('This site is an unofficial app browser for Ubuntu Touch apps. All data for the apps comes from a publicly accessible api. This site is maintained by Brian Douglass and is not endorsed by or affiliated with Ubuntu or Canonical. Ubuntu and Canonical are registered trademarks of Canonical Ltd.')}
        </Modal.Body>

        <Modal.Footer>
          <button className="btn btn-info" onClick={this.props.onHide}>{i18n.t('Close')}</button>
        </Modal.Footer>
      </Modal>
    );
  }
});
