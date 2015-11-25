var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var Slider = require('react-slick');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var AppList = require('./appinfo/appList');

module.exports = React.createClass({
  displayName: 'Index',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    counts: ['counts'],
    top: ['top'],
    'new': ['new'],
    essentials: ['essentials'],
    lng: ['lng'],
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
                <Link to="/apps?sort=-bayesian_average">{i18n.t('Essential Apps')}</Link>
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
              <h1><Link to="/apps?sort=-points">{i18n.t('Top Apps')}</Link></h1>
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
              <h1><Link to="/apps">{i18n.t('New Apps')}</Link></h1>
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
            <h1><Link to="/apps">{i18n.t('Browse')}</Link></h1>
          </div>
        </div>
        <div className="row">
          {this.renderCell(
            i18n.t('Apps'),
            i18n.t('apps', {count: this.state.counts.applications}),
            this.state.counts.applications,
            '/apps?type=application',
            i18n.t('Browse Apps'),
            'fa fa-mobile background-material-light-blue'
          )}

          {this.renderCell(
            i18n.t('Web Apps'),
            i18n.t('web apps', {count: this.state.counts.webapps}),
            this.state.counts.webapps,
            '/apps?type=webapp',
            i18n.t('Browse Web Apps'),
            'fa fa-bookmark background-material-cyan'
          )}

          {this.renderCell(
            i18n.t('Games'),
            i18n.t('games', {count: this.state.counts.games}),
            this.state.counts.games,
            '/apps?category=games',
            i18n.t('Browse Games'),
            'fa fa-gamepad background-material-light-green'
          )}

          {this.renderCell(
            i18n.t('Scopes'),
            i18n.t('scopes', {count: this.state.counts.scopes}),
            this.state.counts.scopes,
            '/apps?type=scope',
            i18n.t('Browse Scopes'),
            'fa fa-search background-material-deep-orange'
          )}
        </div>

        {this.renderEssentialApps()}
        {this.renderTopApps()}
        {this.renderNewApps()}
      </div>
    );
  }
});
