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
            <h1><Link to="/snaps">{i18n.t('Browse')}</Link></h1>
          </div>
        </div>
        <div className="row">
          {this.renderCell(
            i18n.t('Phone Apps'),
            i18n.t('apps', {count: this.state.info.counts.applications}),
            this.state.info.counts.applications,
            '/apps?type=application',
            i18n.t('Browse Phone Apps'),
            'fa fa-mobile background-material-light-blue'
          )}

          {this.renderCell(
            i18n.t('Phone Games'),
            i18n.t('games', {count: this.state.info.counts.games}),
            this.state.info.counts.games,
            '/apps?category=games',
            i18n.t('Browse Phone Games'),
            'fa fa-gamepad background-material-light-green'
          )}

          {this.renderCell(
            i18n.t('Snaps'),
            i18n.t('snaps', {count: this.state.info.counts.snaps}),
            this.state.info.counts.snaps,
            '/snaps',
            i18n.t('Browse Snaps'),
            'fa fa-laptop background-material-cyan'
          )}

          {this.renderCell(
            i18n.t('Gadget Snaps'),
            i18n.t('gadget snaps', {count: this.state.info.counts.snaps}),
            this.state.info.counts.gadget_snaps,
            '/snaps?type=gadget',
            i18n.t('Browse Gadget Snaps'),
            'fa fa-laptop background-material-deep-purple'
          )}
        </div>

        <If value={this.state.info['new'].apps.length > 0}>
          <div>
            <div className="row">
              <div className="col-md-12 text-center">
                <h1><Link to="/apps">{i18n.t('New Phone Apps')}</Link></h1>
              </div>
            </div>

            <AppList apps={this.state.info['new'].apps} view="grid" />
          </div>
        </If>

        <If value={this.state.info.new_snaps.apps.length > 0}>
          <div>
            <div className="row">
              <div className="col-md-12 text-center">
                <h1><Link to="/snaps">{i18n.t('New Snaps')}</Link></h1>
              </div>
            </div>

            <AppList apps={this.state.info.new_snaps.apps} view="grid" />
          </div>
        </If>
      </div>
    );
  }
});
