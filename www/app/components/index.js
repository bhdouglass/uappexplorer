var React = require('react');
var mixins = require('baobab-react/mixins');
var actions = require('../actions');
var AppList = require('./appinfo/appList');

module.exports = React.createClass({
  displayName: 'Index',
  mixins: [
    mixins.branch
  ],
  cursors: {
    counts: ['counts'],
    top: ['top'],
    'new': ['new'],
  },

  componentWillMount: function() {
    //TODO combine into one network request
    actions.getCounts();
    actions.getTopApps();
    actions.getNewApps();
  },

  renderCount: function(name, count) {
    var c = '';
    if (count > 0) {
      c = (
        <p className="list-group-item-text">
          {count} {name}
        </p>
      );
    }

    return c;
  },

  renderCell: function(title, name, count, url, popup, cls) {
    return (
      <div className="col-md-3 col-sm-6">
        <div className="list-group">
          <a className="list-group-item clickable" href={url} title={popup}>
            <div className="row-action-primary">
              <div className="action-icon ubuntu-shape">
                <i className={cls}></i>
              </div>
            </div>

            <div className="row-content">
              <h4 className="list-group-item-heading">{title}</h4>
              {this.renderCount(name, count)}
            </div>
          </a>

          <div className="list-group-separator visible-xs visible-sm"></div>
        </div>
      </div>
    );
  },

  renderTopApps: function() {
    var top = '';
    if (this.state.top.length > 0) {
      top = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h1><a href="/apps?sort=-points">Top Apps</a></h1>
            </div>
          </div>

          <AppList apps={this.state.top} view="grid" />
        </div>
      );
    }

    return top;
  },

  renderNewApps: function() {
    var nw = '';
    if (this.state['new'].length > 0) {
      nw = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h1><a href="/apps">New Apps</a></h1>
            </div>
          </div>

          <AppList apps={this.state['new']} view="grid" />
        </div>
      );
    }

    return nw;
  },

  render: function() {
    return (
      <div className="main">
        <div className="row">
          <div className="col-md-12 text-center">
            <h1><a href="/apps">Browse</a></h1>
          </div>
        </div>
        <div className="row">
          {this.renderCell('Apps', 'apps', this.state.counts.applications, '/apps?type=application', 'Browse Apps', 'fa fa-mobile background-material-light-blue')}
          {this.renderCell('Web Apps', 'web apps', this.state.counts.webapps, '/apps?type=webapp', 'Browse Web Apps', 'fa fa-bookmark background-material-cyan')}
          {this.renderCell('Games', 'games', this.state.counts.games, '/apps?category=games', 'Browse Games', 'fa fa-gamepad background-material-light-green')}
          {this.renderCell('Scopes', 'scopes', this.state.counts.scopes, '/apps?type=scope', 'Browse Scopes', 'fa fa-search background-material-deep-orange')}
        </div>

        {this.renderTopApps()}
        {this.renderNewApps()}
      </div>
    );
  }
});
