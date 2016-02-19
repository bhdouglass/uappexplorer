var React = require('react');
var mixins = require('baobab-react/mixins');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');
var QRCode = require('qrcode.react');
var i18n = require('i18next-client');

var If = require('./if');

module.exports = React.createClass({
  displayName: 'QR',
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
    value: React.PropTypes.string.isRequired,
  },

  render: function() {
    return (
      <div className="qr-code-wrapper">
        <If value={this.props.show}>
          <div className="text-center">
            <div className="qr-code">
              <QRCode value={this.props.value} size={256} />
            </div>
            <div>
              <Link to="/app/com.ubuntu.developer.mzanetti.tagger" onClick={this.props.onHide}>
                {i18n.t('Get a QR scanner for your Ubuntu Touch device')}
              </Link>
            </div>
          </div>

          <div className="pull-right">
            <a className="btn btn-info" onClick={this.props.onHide}>{i18n.t('Close')}</a>
          </div>
        </If>
      </div>
    );
  }
});
