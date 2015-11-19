var React = require('react');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var Link = require('react-router').Link;

var actions = require('../../actions');

module.exports = React.createClass({
  displayName: 'AppRequest',
  mixins: [
    PureRenderMixin
  ],
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      name: '',
      success: null,
      requested_app: null,
    };
  },

  close: function() {
    this.setState({
      name: '',
      success: null,
      requested_app: null,
    });

    this.props.onHide();
  },

  changeName: function(event) {
    this.setState({name: event.target.value});
  },

  request: function() {
    actions.requestApp(this.state.name).then(function(app) {
      if (app) {
        this.setState({
          requested_app: app,
          success: true,
        });
      }
      else {
        this.setState({
          requested_app: null,
          success: false,
        });
      }
    });
  },

  render: function() {
    var status = '';
    if (this.state.success === true) {
      status = (
        <div className="alert alert-success text-center" ng-if="success === true">
          <h4>Found the requested app</h4>
          <Link to={'/app/' + this.state.requested_app.name} onClick={this.props.close}>
            Go there now <i className="fa fa-external-link"></i>
          </Link>
        </div>
      );
    }
    else if (this.state.success === false) {
      status = (
        <div className="alert alert-warning text-center">
          <h4>Could not find the requested app</h4>
        </div>
      );
    }

    return (
      <Modal show={this.props.show} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Missing an app?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              {status}
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              Find an app that has not yet been fetched from the official appstore.
              <br/>
              <br/>
              <div className="form-group">
                <label className="control-label" for="name">App Name (example: com.ubuntu.developer.example)</label>
                <input type="text" className="form-control" id="name" value={this.state.name} onChange={this.changeName} />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div>
            <a className="btn btn-warning" onClick={this.props.close}>Close</a>
          </div>
          <div>
            <a className="btn btn-warning" onClick={this.request}>Find</a>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
});
