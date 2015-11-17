var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

module.exports = React.createClass({
  displayName: 'Share',
  mixins: [
    PureRenderMixin
  ],
  props: {
    url: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      caxton_sent: false,
    };
  },

  qrCode: function() {
    //TODO
  },

  caxton: function() {
    //TODO
  },

  render: function() {
    var style = {display: 'block !important'};
    var gp = 'https://plus.google.com/share?url=' + this.props.url;
    var fb = 'http://www.facebook.com/sharer/sharer.php?u=' + this.props.url;
    var tw = 'https://twitter.com/intent/tweet?text=' + this.props.title + '&url=' + this.props.url + '&via=uappexplorer';
    var rd = 'https://www.reddit.com/submit?url=' + this.props.url;

    var caxton = <img src="/img/caxton.svg" title="Send via Caxton" />;
    if (this.state.caxton_sent) {
      caxton = <i className="fa fa-check fa-2x fa-inverse" title="Sent via Caxton"></i>;
    }

    //The display block is to override the styles set by an adblocker. Some people actually want to be able to use an adblocker and still share to social media
    return (
      <div className="list-group-item-text external-links row">
        <div className="col-sm-2 col-xs-4">
          <a href={gp} className="text-material-red" title="Share on Google" style={style}>
            <i className="fa fa-gps fa-3x"></i>
          </a>
        </div>
        <div className="col-sm-2 col-xs-4">
          <a href={fb} className="text-material-blue" title="Share on Facebook" style={style}>
            <i className="fa fa-fs fa-3x"></i>
          </a>
        </div>
        <div className="col-sm-2 col-xs-4">
          <a href={tw} className="text-material-light-blue" title="Share on Twitter" style={style}>
            <i className="fa fa-ts fa-3x"></i>
          </a>
        </div>
        <div className="clear-fix visible-xs"></div>
        <div className="col-sm-2 col-xs-4">
          <a href={rd} className="text-material-cyan" title="Share on Reddit" style={style}>
            <i className="fa fa-rs fa-3x"></i>
          </a>
        </div>
        <div className="col-sm-2 col-xs-4">
          <a className="text-material-grey caxton-button clickable" title="Send via Caxton" onClick={this.caxton}>
            <i className="fa fa-square fa-3x"></i>
            {caxton}
          </a>
        </div>
        <div className="col-sm-2 col-xs-4">
          <a className="text-material-light-green qr-button clickable" title="QR Code" onClick={this.qrCode}>
            <i className="fa fa-square fa-3x"></i>
            <i className="fa fa-qrcode fa-2x fa-inverse"></i>
          </a>
        </div>
      </div>
    );
  }
});
