var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var Slider = require('react-slick');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var AppList = require('./appinfo/appList');
var AppRow = require('./appinfo/appRow');
var If = require('./helpers/if');

module.exports = React.createClass({
  displayName: 'Index',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    info: ['info'],
    lng: ['lng'],
  },

  componentWillMount: function() {
    actions.getInfo();
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

  render: function() {
    var settings = {
      dots: false,
      infinite: true,
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
    };

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
            i18n.t('apps', {count: this.state.info.counts.applications}),
            this.state.info.counts.applications,
            '/apps?type=application',
            i18n.t('Browse Apps'),
            'fa fa-mobile background-material-light-blue'
          )}

          {this.renderCell(
            i18n.t('Scopes'),
            i18n.t('scopes', {count: this.state.info.counts.scopes}),
            this.state.info.counts.scopes,
            '/apps?type=scope',
            i18n.t('Browse Scopes'),
            'fa fa-search background-material-deep-orange'
          )}

          {this.renderCell(
            i18n.t('Games'),
            i18n.t('games', {count: this.state.info.counts.games}),
            this.state.info.counts.games,
            '/apps?category=games',
            i18n.t('Browse Games'),
            'fa fa-gamepad background-material-light-green'
          )}

          {this.renderCell(
            i18n.t('Snaps'),
            i18n.t('snaps', {count: this.state.info.counts.snaps}),
            this.state.info.counts.snaps,
            '/apps?type=snappy',
            i18n.t('Browse Snaps'),
            'fa fa-laptop background-material-cyan'
          )}
        </div>

        <div className="row">
          <div className="col-md-12 text-center">
            <h1>
              <Link to="/wishlist">{i18n.t('App Wishlist')}</Link>
            </h1>
            <h3>
              <Link to="/wishlist">{i18n.t('What apps do you wish to see on Ubuntu Touch?')}</Link>
            </h3>

            <div className="separator"></div>
          </div>
        </div>

        <If value={this.state.info.loaded && this.state.info.essentials}>
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
                {this.state.info.essentials.apps.map(function(app) {
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
        </If>

        <If value={this.state.info.top.apps.length > 0}>
          <div>
            <div className="row">
              <div className="col-md-12 text-center">
                <h1><Link to="/apps?sort=-points">{i18n.t('Top Apps')}</Link></h1>
              </div>
            </div>

            <AppList apps={this.state.info.top.apps} view="grid" />
          </div>
        </If>

        <AppRow apps={this.state.info['new'].apps}>
          <Link to="/apps">{i18n.t('New Apps')}</Link>
        </AppRow>
      </div>
    );
  }
});
