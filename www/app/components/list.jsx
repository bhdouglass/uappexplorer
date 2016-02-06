var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var AppList = require('./appinfo/appList');
var Share = require('./helpers/share');
var If = require('./helpers/if');

module.exports = React.createClass({
  displayName: 'List',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    userList: ['userList'],
    loading: ['loading'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      view: 'grid',
      editable: false,
    };
  },

  checkEdit: function(state) {
    var editable = state.auth.loggedin && (state.auth.user._id == state.userList.user);
    if (editable !== state.editable) {
      this.setState({editable: editable});
    }
  },

  componentWillMount: function() {
    actions.getUserList(this.props.params.id);
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (this.state.userList && this.state.userList.name) {
      actions.setOG({
        title: 'User List - ' + this.state.userList.name,
        description: 'User list by ' + this.state.userList.user_name,
        image: 'https://uappexplorer.com/img/logo.png',
      });
    }

    if (this.props.params.id != nextProps.params.id) {
      actions.getUserList(nextProps.params.id);
    }

    this.checkEdit(nextState);
  },

  onRemoveClick: function(app) {
    if (this.state.editable) {
      actions.removeUserListApp(this.state.userList, app.name);
    }
  },

  changeView: function(view) {
    this.setState({view: view});
  },

  render: function() {
    var url = window.location.protocol + '//' + window.location.host + '/list/' + this.state.userList._id;
    var loaded = (
      !this.state.loading &&
      this.state.userList &&
      this.state.userList._id == this.props.params.id
    );

    return (
      <div className="list">
        <If value={!loaded}>
          <div className="row">
            <div className="col-md-12 text-center">
              <i className="fa fa-spinner fa-spin fa-4x"></i>
            </div>
          </div>
        </If>

        <If value={loaded}>
          <div className="row list-header" ng-show="list">
            <div className="col-md-8">
              <h1 ng-show="list.name">
                {i18n.t('User List:')} {this.state.userList.name}
              </h1>
              {this.state.userList.user_name ? i18n.t('By:') + ' ' + this.state.userList.user_name : ''}
            </div>

            <div className="col-md-4">
              <div className="row">
                <div className="col-md-12">
                  <div className="btn-toolbar pull-right">
                    <div className="btn-group">
                      <a className={(this.state.view == 'grid') ? 'btn clickable bold btn-material-light-blue view-button' : 'btn clickable'} onClick={this.changeView.bind(this, 'grid')}>
                        <span className="hidden-xs">{i18n.t('Grid')}</span> <i className="fa fa-th-large"></i>
                      </a>
                      <a className={(this.state.view != 'grid') ? 'btn clickable bold btn-material-light-blue view-button' : 'btn clickable'} onClick={this.changeView.bind(this, 'list')}>
                        <span className="hidden-xs">{i18n.t('List')}</span> <i className="fa fa-list"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Share url={url} title={this.state.userList.name} caxtonUrl={url} />
              </div>
            </div>
          </div>

          <AppList apps={this.state.userList.full_packages} view={this.state.view} editable={this.state.editable} onRemoveClick={this.onRemoveClick} />

          <If value={this.state.userList.packages && this.state.userList.packages.length === 0}>
            <div className="row">
              <h3 className="text-center">{i18n.t('This list is empty!')}</h3>
            </div>
          </If>
        </If>
      </div>
    );
  },
});
