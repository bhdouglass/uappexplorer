var React = require('react');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

module.exports = React.createClass({
  displayName: 'WishUpvote',
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

  getInitialState: function() {
    return {
      price: 0,
    };
  },

  vote: function() {
    this.props.onHide(this.state.price);
  },

  close: function() {
    this.props.onHide(false);
  },

  priceChange: function(event) {
    this.setState({price: event.target.value});
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.close} className="wish">
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('How much would you be willing pay for this app?')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="input-group price">
            <input type="number" min="0" onChange={this.priceChange} className="form-control" />
              <div className="input-group-addon">USD</div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-warning" onClick={this.close}>{i18n.t('Cancel')}</a>
          </span>
          <span>
            <a className="btn btn-material-blue" onClick={this.vote}>{i18n.t('Vote')}</a>
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
});
