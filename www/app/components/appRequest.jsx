var React = require('react');
var Router = require('react-router');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var Link = require('react-router').Link;
var i18n = require('i18next-client');

var actions = require('../actions');

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
            {i18n.t('Go there now')} <i className="fa fa-external-link"></i>
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
      <div>
        <h1>{i18n.t('Missing an app?')}</h1>

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

        <div className="pull-right">
          <a className="btn btn-material-blue" onClick={this.request}>{i18n.t('Find')}</a>
        </div>

        <div className="clearfix"></div>
      </div>
    );
  }
});
