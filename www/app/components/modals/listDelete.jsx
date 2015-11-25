var React = require('react');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../../actions');

module.exports = React.createClass({
  displayName: 'ListDelete',
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
    list: React.PropTypes.object.isRequired,
  },

  deleteList: function() {
    var self = this;
    actions.deleteUserList(this.props.list._id).then(function() {
      self.props.onHide(true);
    });
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('Are you sure you want to delete this list?')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-info" onClick={this.props.onHide}>
              <i className="fa fa-close"></i> {i18n.t('No')}
            </a>
          </span>

          <span>
            <a className="btn btn-success" onClick={this.deleteList}>
              <i className="fa fa-check"></i> {i18n.t('Yes')}
            </a>
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
});
