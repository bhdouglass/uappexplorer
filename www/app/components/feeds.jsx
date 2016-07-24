var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

module.exports = React.createClass({
  displayName: 'Feeds',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },

  render: function() {
    return (
      <div className="center">
        <h1>{i18n.t('RSS Feeds')}</h1>

        <h4>
          <a href="http://feeds.feedburner.com/UbuntuTouchNewApps">
            <i className="fa fa-fw fa-rss-square"></i> {i18n.t('New Apps')}
          </a>
        </h4>
        <h4>
          <a href="http://feeds.feedburner.com/uAppExplorerUpdatedApps">
            <i className="fa fa-fw fa-rss-square"></i> {i18n.t('Updated Apps')}
          </a>
        </h4>

        <h1>{i18n.t('Social Media')}</h1>

        <h4>
          <a href="https://twitter.com/uappexplorer" style={{display: 'inline-block !important'}}><i className="fa fa-fw fa-t"></i> Twitter</a>
        </h4>
        <h4>
          <a href="https://plus.google.com/+Uappexplorer-ubuntu" style={{display: 'inline-block !important'}}><i className="fa fa-fw fa-gp"></i> Google+</a>
        </h4>
      </div>
    );
  }
});
