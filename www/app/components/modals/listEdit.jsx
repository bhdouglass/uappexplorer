var React = require('react');
var Modal = require('react-bootstrap/lib/Modal');
var mixins = require('baobab-react/mixins');
var debounce = require('debounce');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../../actions');
var info = require('../../info');
var AppCell = require('../appinfo/appCell');
var Alerts = require('../helpers/alerts');

module.exports = React.createClass({
  displayName: 'ListEdit',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    list: React.PropTypes.object,
  },
  cursors: {
    loading: ['loading'],
    apps: ['apps'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      list: {
        _id: null,
        name: '',
        sort: '-points',
        packages: [],
      },
      list_apps: [],
      term: '',
      search_key: null,
    };
  },

  componentWillMount: function() {
    this.debounceSearch = debounce(this.search, 300);

    if (this.props.list && this.props.list._id) {
      if (this.props.list.packages.length > 0) {
        var paging = {query: {name: {'$in': this.props.list.packages}, mini: true}};
        var self = this;
        actions.getApps(paging).then(function(data) {
          self.setState({list_apps: data.apps});
        });
      }

      this.setState({list: this.props.list});
    }
  },

  componentWillUpdate: function(newProps) {
    if (
      (this.props.list === null && newProps.list !== null) ||
      (this.props.list !== null && newProps.list === null) ||
      (this.props.list && newProps.list && this.props.list._id != newProps.list._id)
    ) {
      if (newProps.list && newProps.list.packages.length > 0) {
        var paging = {query: {name: {'$in': newProps.list.packages}}, mini: true};
        var self = this;
        actions.getApps(paging).then(function(data) {
          self.setState({list_apps: data.apps});
        });
      }

      this.setState({
        list: {
          _id: newProps.list ? newProps.list._id : null,
          name: newProps.list ? newProps.list.name : '',
          sort: newProps.list ? newProps.list.sort : '-points',
          packages: newProps.list ? newProps.list.packages : [],
        },
        list_apps: [],
      });
    }
  },

  onHide: function(saved) {
    this.props.onHide(saved);
  },

  changeName: function(event) {
    this.state.list.name = event.target.value;
    this.setState({list: this.state.list});
  },

  changeSort: function(event) {
    this.state.list.sort = event.target.value;
    this.setState({list: this.state.list});
  },

  addApp: function(app, event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.state.list.packages.indexOf(app.name) == -1) {
      var packages = [];
      for (var i = 0; i < this.state.list.packages.length; i++) {
        packages.push(this.state.list.packages[i]);
      }
      packages.push(app.name);

      var list_apps = [];
      var found = false;
      for (var j = 0; j < this.state.list_apps.length; j++) {
        list_apps.push(this.state.list_apps[j]);

        if (this.state.list_apps[j].name == app.name) {
          found = true;
        }
      }

      if (!found) {
        list_apps.push(app);
      }

      this.setState({
        list: {
          _id: this.state.list._id,
          name: this.state.list.name,
          sort: this.state.list.sort,
          packages: packages,
        },
        list_apps: list_apps,
      });
    }
  },

  removeApp: function(app) {
    var index = this.state.list.packages.indexOf(app.name);
    var packages = [];
    for (var i = 0; i < this.state.list.packages.length; i++) {
      if (i != index) {
        packages.push(this.state.list.packages[i]);
      }
    }

    this.setState({list: {
      _id: this.state.list._id,
      name: this.state.list.name,
      sort: this.state.list.sort,
      packages: packages,
    }});
  },

  search: function(event) {
    if (this.state.term != event.target.value) {
      var paging = {
        search: event.target.value,
        sort: this.state.list.sort,
        mini: true,
        limit: 5,
      };

      actions.getApps(paging);

      this.setState({
        term: event.target.value,
        search_key: JSON.stringify(paging),
      });
    }
  },

  save: function() {
    var self = this;
    if (this.state.list._id) { //Update
      actions.updateUserList(this.state.list._id, {
        name: this.state.list.name,
        sort: this.state.list.sort,
        packages: this.state.list.packages,
      }).then(function() {
        self.props.onHide(true);
        self.setState({
          list: {
            _id: null,
            name: '',
            sort: '-points',
            packages: [],
          },
          list_apps: [],
        });
      });
    }
    else { //Create
      actions.createUserList({
        name: this.state.list.name,
        sort: this.state.list.sort,
        packages: this.state.list.packages,
      }).then(function() {
        self.props.onHide(true);
        self.setState({
          list: {
            _id: null,
            name: '',
            sort: '-points',
            packages: [],
          },
          list_apps: [],
        });
      });
    }
  },

  render: function() {
    var title = i18n.t('Create List');
    var save = (
      <span>
        <i className="fa fa-plus"></i> {i18n.t('Create')}
      </span>
    );

    if (this.state.list && this.state.list._id) {
      title = i18n.t('Edit List');

      save = (
        <span>
          <i className="fa fa-check"></i> {i18n.t('Save')}
        </span>
      );
    }

    var disabled = '';
    if (this.state.list.name === '') {
      disabled = 'disabled';
    }

    var list_apps = [];
    if (!this.state.loading && this.state.list_apps) {
      list_apps = this.state.list_apps;
    }

    var search_apps = [];
    if (!this.state.loading && this.state.search_key && this.state.apps[this.state.search_key]) {
      search_apps = this.state.apps[this.state.search_key].apps;
    }

    var not_found = '';
    if (!this.state.loading && search_apps.length === 0 && this.state.term !== '') {
      not_found = (
        <div className="text-center">
          {i18n.t('No apps found, try searching again.')}
        </div>
      );
    }

    return (
      <Modal show={this.props.show} onHide={this.onHide.bind(this, false)} backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alerts />

          <form className="form-horizontal list-edit" role="form">
            <div className="form-group">
              <label htmlFor="name" className="col-sm-3 control-label">{i18n.t('List Name:')}</label>
              <div className="col-sm-9">
                <input type="text" className="form-control" id="name" value={this.state.list.name} onChange={this.changeName} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sort" className="col-sm-3 control-label">{i18n.t('Sort Apps By:')}</label>
              <div className="col-sm-9">
                <select id="sort" className="form-control" value={this.state.list.sort} onChange={this.changeSort}>
                  {info.sorts().map(function(sort) {
                    return <option value={sort.value} key={sort.value}>{sort.label}</option>;
                  }, this)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="col-sm-3 control-label">{i18n.t('Apps:')}</label>
              <div className="col-sm-9">
                {list_apps.map(function(app) {
                  var component = '';
                  if (this.state.list.packages.indexOf(app.name) != -1) {
                    component = (
                      <div key={'list' + app.name}>
                        {app.title} <a onClick={this.removeApp.bind(this, app)} className="clickable"><i className="fa fa-remove"></i></a>
                      </div>
                    );
                  }

                  return component;
                }, this)}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="search" className="col-sm-3 control-label">{i18n.t('Add Apps:')}</label>
              <div className="col-sm-9">
                <div className="input-group search-box">
                  <input type="text" className="form-control" id="search" onChange={this.debounceSearch} defaultValue={this.state.term} />
                  <span className="input-group-addon">
                    <i className="fa fa-search"></i>
                  </span>
                </div>

                {search_apps.map(function(app) {
                  return (
                    <div className="row" key={app.name}>
                      <div className="col-md-12">
                        <AppCell onClick={this.addApp.bind(this, app)} app={app} />
                      </div>
                    </div>
                  );
                }, this)}

                {not_found}
              </div>
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-info" onClick={this.onHide.bind(this, false)}>
              <i className="fa fa-close"></i> {i18n.t('Close')}
            </a>
          </span>

          <span>
            <a className="btn btn-success" onClick={this.save} disabled={disabled}>
              {save}
            </a>
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
});
