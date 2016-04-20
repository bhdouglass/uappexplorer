var React = require('react');
var mixins = require('baobab-react/mixins');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../../actions');
var utils = require('../../utils');

module.exports = React.createClass({
  displayName: 'AddToList',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
    auth: ['auth'],
    userLists: ['userLists'],
    app: ['app'],
  },

  changeList: function(event) {
    for (var i = 0; i < this.state.userLists.lists.length; i++) {
      if (this.state.userLists.lists[i]._id == event.target.value) {
        actions.addUserListApp(this.state.userLists.lists[i], this.state.app.name);

        break;
      }
    }
  },

  render: function() {
    var component = <div></div>;
    if (this.state.auth.loggedin && this.state.userLists.loaded) {
      var existing_ids = [];
      var existing = [];
      for (var i = 0; i < this.state.userLists.lists.length; i++) {
        if (this.state.userLists.lists[i].packages.indexOf(this.state.app.name) > -1) {
          existing_ids.push(this.state.userLists.lists[i]._id);
          existing.push(this.state.userLists.lists[i]);
        }
      }

      var lists = '';
      if (this.state.userLists.lists.length === 0) {
        lists = (
          <div>
            <Link to="/me">{i18n.t('No lists, create one!')}</Link>
          </div>
        );
      }
      else {
        lists = (
          <div>
            {i18n.t('Add to list:')}
            <select className="form-control" onChange={this.changeList}>
              <option value="">{i18n.t('- Choose a list -')}</option>
              {this.state.userLists.lists.map(function(list) {
                if (existing_ids.indexOf(list._id) == -1) {
                  return (
                    <option value={list._id} key={list._id}>{list.name}</option>
                  );
                }
              }, this)}
            </select>
          </div>
        );
      }

      var already_on = '';
      if (existing.length > 0) {
        already_on = (
          <div>
            {i18n.t('This app is on these lists:')}
            {existing.map(function(list) {
              var url = '/list/' + list._id;
              return <Link className="label label-success list-label" to={url} key={list._id}>{list.name}</Link>;
            }, this)}
          </div>
        );
      }

      component = (
        <div ng-show="loggedin">
          <div className="list-group-item">
            <div className="row-action-primary">
              <div className="action-icon ubuntu-shape">
                <i className="fa fa-list-ul" style={utils.strToColor(this.state.app.title, 'backgroundColor')}></i>
              </div>
            </div>

            <div className="row-content">
              <div className="list-group-item-text">
                {lists}

                <br/>
                {already_on}
              </div>
            </div>

          </div>
        </div>
      );
    }

  return component;
  }
});
