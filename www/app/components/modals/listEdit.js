var React = require('react');
var Modal = require('react-bootstrap/lib/Modal');
var info = require('../../info');

module.exports = React.createClass({
  displayName: 'ListEdit',
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    list: React.PropTypes.object,
  },

  getInitialState: function() {
    return {
      list: {
        _id: null,
        name: '',
        sort: '-points',
        packages: [],
      }
    };
  },

  componentWillMount: function() {
    if (this.props.list && this.props.list._id) {
      this.setState({'list': this.props.list});
    }
  },

  componentWillUpdate: function(newProps) {
    if (
      (this.props.list === null && newProps.list !== null) ||
      (this.props.list !== null && newProps.list === null) ||
      (this.props.list && newProps.list && this.props.list._id != newProps.list._id)
    ) {
      this.setState({'list': newProps.list});
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

  save: function() {
    //TODO
  },

  render: function() {
    var title = 'Create List';
    var save = (
      <span>
        <i className="fa fa-plus"></i> Create
      </span>
    );

    if (this.state.list && this.state.list._id) {
      title = 'Edit List';

      save = (
        <span>
          <i className="fa fa-check"></i> Save
        </span>
      );
    }

    var disabled = '';
    if (this.state.list.name === '') {
      disabled = 'disabled';
    }

    return (
      <Modal show={this.props.show} onHide={this.onHide.bind(this, false)} backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form className="form-horizontal" role="form">
            <div className="form-group">
              <label htmlFor="name" className="col-sm-3 control-label">List Name:</label>
              <div className="col-sm-9">
                <input type="text" className="form-control" id="name" value={this.state.list.name} onChange={this.changeName} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sort" className="col-sm-3 control-label">Sort Apps By:</label>
              <div className="col-sm-9">
                <select id="sort" className="form-control" value={this.state.list.sort} onChange={this.changeSort}>
                  {info.sorts.map(function(sort) {
                    return <option value={sort.value} key={sort.value}>{sort.label}</option>;
                  }, this)}
                </select>
              </div>
            </div>

          </form>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-info" onClick={this.onHide.bind(this, false)}>
              <i className="fa fa-close"></i> Close
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

    /*
    <div className="form-group">
      <label htmlFor="name" className="col-sm-3 control-label">Apps:</label>
      <div className="col-sm-9">
        <div ng-repeat="app in apps">
          <span ng-bind="app.title"></span>
          <a ng-click="removeApp(app.name)" className="clickable"><i className="fa fa-remove"></i></a>
        </div>

        <div ng-show="appsError" className="text-center text-danger">
          Could not retrieve app list at this time, please try again later.
        </div>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="name" className="col-sm-3 control-label">Add Apps:</label>
      <div className="col-sm-9">
        <div className="input-group search-box">
          <input type="text" className="form-control" ng-model="search" id="search" />
          <span className="input-group-addon">
            <i className="fa fa-search" ng-click="search = ''" ng-className="{'fa-search': !search_hover, 'fa-times-circle-o': search_hover}" ng-mouseenter="search_hover = true" ng-mouseleave="search_hover = false" title="{{'Clear search'|translate}}"></i>
          </span>
        </div>

        <div className="row" ng-repeat="app in searchApps">
          <div className="col-md-12">
            <app-view ng-model="app" ng-click="addApp(app)" link="false"></app-view>
          </div>
        </div>

        <div ng-show="searchApps.length === 0 && !searchError" className="text-center">
          No apps found
        </div>

        <div ng-show="searchError" className="text-center text-danger">
          Could not retrieve search at this time, please try again later.
        </div>
      </div>
    </div>
    */
  }
});
