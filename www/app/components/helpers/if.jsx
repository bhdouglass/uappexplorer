var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

module.exports = React.createClass({
  displayName: 'If',
  mixins: [
    PureRenderMixin
  ],
  props: {
    value: React.PropTypes.bool.isRequired,
  },

  render: function() {
    var component = '';
    if (this.props.value) {
      component = this.props.children;
    }

    return <div>{component}</div>;
  }
});
