var React = require('react');
var Router = require('react-router');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var Link = require('react-router').Link;
var i18n = require('i18next-client');

var actions = require('../../actions');

module.exports = React.createClass({
  displayName: 'AppRequest',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      show: true,
      name: '',
      success: null,
      requested_app: null,
    };
  },

  componentWillMount: function() {
    actions.setOG({
      title: 'uApp Explorer - Find App',
      description: 'Find an app that has not yet been fetched from the official appstore',
      image: 'https://uappexplorer.com/img/logo.png',
    });
  },

  close: function() {
    this.setState({
      show: false,
      name: '',
      success: null,
      requested_app: null,
    });

    this.history.pushState(null, '/apps');
  },

  changeName: function(event) {
    this.setState({name: event.target.value});
  },

  request: function() {
    var self = this;
    actions.requestApp(this.state.name).then(function(app) {
      if (app) {
        self.setState({
          requested_app: app,
          success: true,
        });
      }
      else {
        self.setState({
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
        <div className="alert alert-success text-center">
          <h4>{i18n.t('Found the requested app')}</h4>
          <Link to={'/app/' + this.state.requested_app.name} onClick={this.props.close}>
            Go there now <i className="fa fa-external-link"></i>
          </Link>
        </div>
      );
    }
    else if (this.state.success === false) {
      status = (
        <div className="alert alert-warning text-center">
          <h4>{i18n.t('Could not find the requested app')}</h4>
        </div>
      );
    }

    return (
      <Modal show={this.state.show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('Missing an app?')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              {status}
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              {i18n.t('Find an app that has not yet been fetched from the official appstore.')}
              <br/>
              <br/>
              <div className="form-group">
                <label className="control-label" htmlFor="name">{i18n.t('App Name (example: com.ubuntu.developer.example)')}</label>
                <input type="text" className="form-control" id="name" value={this.state.name} onChange={this.changeName} />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-warning" onClick={this.close}>{i18n.t('Close')}</a>
          </span>
          <span>
            <a className="btn btn-material-blue" onClick={this.request}>{i18n.t('Find')}</a>
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
});
