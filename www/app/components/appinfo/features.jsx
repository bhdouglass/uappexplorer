var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

module.exports = React.createClass({
  displayName: 'Features',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    features: React.PropTypes.array.isRequired,
  },

  render: function() {
    var features = [];
    for (var index in this.props.features) { //Only show the ones we care about
      if (['push_helper', 'url_dispatcher', 'account_service'].indexOf(this.props.features[index]) >= 0) {
        features.push(this.props.features[index]);
      }
    }

    return (
      <span>
        {features.map(function(feature) {
          var feature_map = {
            push_helper: i18n.t('Push Notifications'),
            url_dispatcher: i18n.t('Opens Urls'),
            account_service: i18n.t('Account Integration'),
          };

          var labels = {
            push_helper: 'label-material-red',
            url_dispatcher: 'label-material-amber',
            account_service: 'label-material-brown',
          };

          var cls = 'label ' + labels[feature];
          var title = feature_map[feature];

          return <span className={cls} key={feature}>{title}</span>;
        }, this)}
      </span>
    );
  }
});
