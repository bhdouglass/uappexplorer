var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

module.exports = React.createClass({
  displayName: 'If',
  mixins: [
    PureRenderMixin
  ],
  props: {
    value: React.PropTypes.bool.isRequired,
    element: React.PropTypes.string,
    className: React.PropTypes.string,
  },

  render: function() {
    var children = '';
    if (this.props.value) {
      children = this.props.children;
    }

    var component = <div></div>;
    if (this.props.element == 'li') {
      component = <li className={this.props.className}>{children}</li>;
    }
    else if (this.props.element == 'span') {
      component = <span className={this.props.className}>{children}</span>;
    }
    else {
      component = <div className={this.props.className}>{children}</div>;
    }

    return component;
  }
});
