var React = require('react');
var Router = require('react-router');
var mixins = require('baobab-react/mixins');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var utils = require('../utils');
var ListEdit = require('./modals/listEdit');
var ListDelete = require('./modals/listDelete');

module.exports = React.createClass({
  displayName: 'Me',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    userLists: ['userLists'],
    savingSettings: ['savingSettings'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      caxton: '',
      edit: false,
      delet: false,
      current_list: null,
    };
  },

  componentWillMount: function() {
    actions.setOG({
      title: 'uApp Explorer',
      description: 'Browse and discover apps for Ubuntu Touch',
      image: 'https://uappexplorer.com/img/logo.png',
    });

    var self = this;
    actions.login().then(function(auth) {
      if (auth.loggedin) {
        actions.getUserLists();
      }
      else {
        self.history.pushState(null, '/');
      }
    });
  },

  caxtonChange: function(event) {
    this.setState({caxton: event.target.value});
  },

  saveSettings: function() {
    console.log('savesettings');
    actions.saveSettings({
      caxton: this.state.caxton,
    });
  },

  removeList: function(list) {
    this.setState({
      delet: true,
      current_list: list,
    });
  },

  newList: function() {
    this.setState({
      edit: true,
      current_list: null,
    });
  },

  editList: function(list) {
    this.setState({
      edit: true,
      current_list: list,
    });
  },

  close: function(refresh) {
    this.setState({
      edit: false,
      delet: false,
      current_list: null,
    });

    if (refresh) {
      actions.getUserLists();
    }
  },

  renderMain: function() {
    var disabled = '';
    var cls = 'fa fa-check';
    if (this.state.savingSettings) {
      disabled = 'disabled';
      cls = 'fa fa-spinner fa-spin';
    }

    if (this.state.caxton === '') {
      disabled = 'disabled';
    }

    return (
      <div>
        <div className="row">
          <div className="col-sm-12 text-center">
            <h1>{i18n.t('Welcome')}</h1>
            <h3>{this.state.auth.user.name ? this.state.auth.user.name : this.state.auth.user.username}</h3>
          </div>
        </div>

        <div className="row settings">
          <div className="col-sm-offset-2 col-sm-8">
            <h3>{i18n.t('Settings')}</h3>

            <form className="form-horizontal" role="form">
              <div className="form-group">
                <label htmlFor="caxton_code" className="col-sm-3 control-label">
                  <a href="https://caxton.herokuapp.com/" target="_blank">{i18n.t('Caxton Code')}</a>:
                </label>
                <div className="col-sm-9">
                  <input type="text" className="form-control" id="caxton_code" value={this.state.caxton} onChange={this.caxtonChange} />
                  <span className="small-note">
                    {this.state.auth.user.has_caxton ? i18n.t('You are already connected via Caxton!') : ''}
                  </span>
                </div>
              </div>

              <div className="pull-right">
                <a className="btn btn-success" onClick={this.saveSettings} disabled={disabled}>
                  <i className={cls}></i> Save
                </a>
              </div>
            </form>
          </div>
        </div>

        <div className="row lists">
          <div className="col-sm-12">
            <a className="btn btn-material-light-blue btn-sm pull-right" onClick={this.newList}>
              <i className="fa fa-plus"></i> <span className="hidden-xs">{i18n.t('New List')}</span>
            </a>

            <h3>{i18n.t('My Lists')}</h3>
          </div>
        </div>

        {this.state.userLists.lists.map(function(list) {
          var link = '/list/' + list._id;

          var cls = 'fa fa-list-ul';
          var name = list.name.toLowerCase();
          if (name.indexOf('favorite') > -1) {
            cls = 'fa fa-star';
          }
          else if (name.indexOf('love') > -1 || name.indexOf('heart') > -1) {
            cls = 'fa fa-heart';
          }

          return (
            <div key={link}>
              <div className="row lists">
                <div className="col-xs-12">
                  <div className="pull-right">
                    <Link className="btn btn-info btn-sm hidden-xs" to={link}>
                      <i className="fa fa-eye"></i> {i18n.t('View')}
                    </Link>

                    <a className="btn btn-success btn-sm" onClick={this.editList.bind(this, list)}>
                      <i className="fa fa-edit"></i> <span className="hidden-xs">{i18n.t('Edit')}</span>
                    </a>

                    <button className="btn btn-danger btn-sm" onClick={this.removeList.bind(this, list)}>
                      <i className="fa fa-trash"></i> <span className="hidden-xs">{i18n.t('Delete')}</span>
                    </button>
                  </div>

                  <div className="list-group">
                    <Link className="list-group-item clickable" to={link}>
                      <div className="row-action-primary">
                        <div className="action-icon ubuntu-shape">
                          <i className={cls} style={utils.strToColor(list.name, 'backgroundColor')}></i>
                        </div>
                      </div>

                      <div className="row-content">
                        <h4 className="list-group-item-heading">{list.name}</h4>
                        <p className="list-group-item-text">
                          {list.packages.length} {i18n.t('apps', {count: list.packages.length})}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xs-12">
                  <div className="separator"></div>
                </div>
              </div>
            </div>
          );
        }, this)}

        <ListEdit show={this.state.edit} onHide={this.close} list={this.state.current_list} />
        <ListDelete show={this.state.delet} onHide={this.close} list={this.state.current_list} />
      </div>
    );
  },

  render: function() {
    var view = '';
    if (this.state.auth.loggedin) {
      view = this.renderMain();
    }
    else {
      view = <div></div>; //Users should never be presented with this
    }

    return view;
  }
});
