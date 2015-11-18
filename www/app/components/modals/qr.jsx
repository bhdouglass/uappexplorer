var React = require('react');
var Modal = require('react-bootstrap/lib/Modal');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');
var QRCode = require('qrcode.react');

module.exports = React.createClass({
  displayName: 'QR',
  mixins: [
    PureRenderMixin
  ],
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    value: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>QR Code for {this.props.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="text-center">
            <QRCode value={this.props.value} size={256} />
            <div>
              <Link to="/app/com.ubuntu.developer.mzanetti.tagger" onClick={this.props.onHide}>
                Get a QR scanner for your Ubuntu Touch device
              </Link>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <a className="btn btn-info" onClick={this.props.onHide}>Close</a>
        </Modal.Footer>
      </Modal>
    );
  }
});
