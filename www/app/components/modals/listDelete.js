var React = require('react');
var Modal = require('react-bootstrap/lib/Modal');
var actions = require('../../actions');

module.exports = React.createClass({
  displayName: 'ListDelete',
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
    var name = this.props.list ? this.props.list.name : '';
    var title = 'Are you sure you want to delete "' + name + '"?';

    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-info" onClick={this.props.onHide}>
              <i className="fa fa-close"></i> No
            </a>
          </span>

          <span>
            <a className="btn btn-success" onClick={this.deleteList}>
              <i className="fa fa-check"></i> Yes
            </a>
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
});
