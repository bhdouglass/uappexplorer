var React = require('react');
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
            snappy: i18n.t('Snap'),
            snappy_oem: i18n.t('OEM Snap'),
            snappy_os: i18n.t('OS Snap'),
            snappy_kernel: i18n.t('Kernel Snap'),
            snappy_gadget: i18n.t('Gadget Snap'),
            snappy_framework: i18n.t('Framework Snap'),
            snappy_application: i18n.t('Snap'),
            unknown: i18n.t('Unknown'),
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
          else if (['snappy', 'snappy_oem', 'snappy_os', 'snappy_kernel', 'snappy_gadget', 'snappy_framework', 'snappy_application'].indexOf(type) >= 0) {
            cls += 'label-material-deep-purple';
          }
          else {
            cls += 'label-material-grey';
          }

          return <span className={cls} key={type}>{title}</span>;
        }, this)}
      </span>
    );
  }
});
