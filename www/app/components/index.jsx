var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var Slider = require('react-slick');

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
    essentials: ['essentials'],
  },

  componentWillMount: function() {
    //TODO combine into one network request
    actions.getCounts();
    actions.getTopApps();
    actions.getNewApps();
    actions.getEssentials();
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
          <Link to={url} className="list-group-item clickable" title={popup}>
            <div className="row-action-primary">
              <div className="action-icon ubuntu-shape">
                <i className={cls}></i>
              </div>
            </div>

            <div className="row-content">
              <h4 className="list-group-item-heading">{title}</h4>
              {this.renderCount(name, count)}
            </div>
          </Link>

          <div className="list-group-separator visible-xs visible-sm"></div>
        </div>
      </div>
    );
  },

  renderEssentialApps: function() {
    var essentials = '';
    if (this.state.essentials.loaded) {
      var settings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
      };

      essentials = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h1>
                <Link to="/apps?sort=-bayesian_average">Essential Apps</Link>
              </h1>
            </div>
          </div>

          <div className="row">
            <div className="essentials margin-auto">
              <Slider {...settings}>
                {this.state.essentials.apps.map(function(app) {
                  var link = '/app/' + app.name;
                  return (
                    <div className="ubuntu-shape" key={link}>
                      <img src={app.icon} className="rounded" />
                      <div className="carousel-caption">
                        <h3><Link to={link}>{app.title}</Link></h3>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
          </div>
        </div>
      );
    }

    return essentials;
  },

  renderTopApps: function() {
    var top = '';
    if (this.state.top.length > 0) {
      top = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h1><Link to="/apps?sort=-points">Top Apps</Link></h1>
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
              <h1><Link to="/apps">New Apps</Link></h1>
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
            <h1><Link to="/apps">Browse</Link></h1>
          </div>
        </div>
        <div className="row">
          {this.renderCell('Apps', 'apps', this.state.counts.applications, '/apps?type=application', 'Browse Apps', 'fa fa-mobile background-material-light-blue')}
          {this.renderCell('Web Apps', 'web apps', this.state.counts.webapps, '/apps?type=webapp', 'Browse Web Apps', 'fa fa-bookmark background-material-cyan')}
          {this.renderCell('Games', 'games', this.state.counts.games, '/apps?category=games', 'Browse Games', 'fa fa-gamepad background-material-light-green')}
          {this.renderCell('Scopes', 'scopes', this.state.counts.scopes, '/apps?type=scope', 'Browse Scopes', 'fa fa-search background-material-deep-orange')}
        </div>

        {this.renderEssentialApps()}
        {this.renderTopApps()}
        {this.renderNewApps()}
      </div>
    );
  }
});
