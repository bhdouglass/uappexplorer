var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

module.exports = React.createClass({
  displayName: 'Types',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    types: React.PropTypes.array.isRequired,
  },

  render: function() {
    return (
      <span>
        {this.props.types.map(function(type) {
          var types = {
            application: i18n.t('App'),
            scope: i18n.t('Scope'),
            webapp: i18n.t('Web App'),
            snappy: i18n.t('Snappy App'),
          };

          var cls = 'label ';
          var title = types[type];

          if (type == 'application') {
            cls += 'label-material-light-blue';
          }
          else if (type == 'scope') {
            cls += 'label-material-orange';
          }
          else if (type == 'webapp') {
            cls += 'label-material-cyan';
          }
          else if (type == 'snappy') {
            cls += 'label-material-deep-purple';
          }

          return <span className={cls} key={type}>{title}</span>;
        }, this)}
      </span>
    );
  }
});
