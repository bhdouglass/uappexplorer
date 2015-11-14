var React = require('react');
var mixins = require('baobab-react/mixins');
var actions = require('../actions');
var AppList = require('./appinfo/appList');
var Share = require('./share');

module.exports = React.createClass({
  displayName: 'List',
  mixins: [
    mixins.branch,
  ],
  cursors: {
    userList: ['userList'],
    loading: ['loading'],
  },

  componentWillMount: function() {
    actions.getUserList(this.props.params.id);
  },

  componentWillUpdate: function(nextProps) {
    if (this.props.params.id != nextProps.params.id) {
      actions.getUserList(nextProps.params.id);
    }
  },

  getInitialState: function() {
    return {
      view: 'grid',
    };
  },

  changeView: function(view) {
    this.setState({view: view});
  },

  renderMain: function() {
    var url = window.location.protocol + '://' + window.location.host + '/list/' + this.state.userList._id;

    var grid_cls = 'btn clickable';
    var list_cls = 'btn clickable';
    if (this.state.view == 'grid') {
      grid_cls = 'btn clickable bold btn-material-light-blue view-button';
    }
    else {
      list_cls = 'btn clickable bold btn-material-light-blue view-button';
    }

    var user_name = '';
    if (this.state.userList.user_name) {
      user_name = 'By: ' + this.state.userList.user_name;
    }

    var no_apps = '';
    if (this.state.userList.packages) {
      no_apps = (
        <div class="row">
          <h3 className="text-center">This list is empty!</h3>
        </div>
      );
    }

    return (
      <div className="list">
        <div className="row list-header" ng-show="list">
          <div className="col-md-8">
            <h1 ng-show="list.name">
              User List: {this.state.userList.name}
            </h1>
            {user_name}
          </div>

          <div className="col-md-4">
            <div className="row">
              <div className="col-md-12">
                <div className="btn-toolbar pull-right">
                  <div className="btn-group">
                    <a className={grid_cls} onClick={this.changeView.bind(this, 'grid')}>
                      <span className="hidden-xs">Grid</span> <i className="fa fa-th-large"></i>
                    </a>
                    <a className={list_cls} onClick={this.changeView.bind(this, 'list')}>
                      <span className="hidden-xs">List</span> <i className="fa fa-list"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Share url={url} title={this.state.userList.name} />
            </div>
          </div>
        </div>

        <AppList apps={this.state.userList.full_packages} view={this.state.view} />
        {no_apps}
      </div>
    );
    //TODO <a ng-if="editable" ng-click="removeApp(app.name)" className="clickable top-right" title="{{'Remove this app from your list'|translate}}"><i className="fa fa-close"></i></a>
  },

  render: function() {
    var component = '';

    if (!this.state.loading && this.state.userList && this.state.userList._id == this.props.params.id) {
      component = this.renderMain();
    }
    else {
      component = (
        <div className="list">
          <div className="row">
            <div className="col-md-12 text-center">
              <i className="fa fa-spinner fa-spin fa-4x"></i>
            </div>
          </div>
        </div>
      );
    }

    return component;
  },
});
