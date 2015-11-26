var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var tree = require('../state');
var Wrapper = require('./wrapper');

module.exports = React.createClass({
  displayName: 'Root',
  mixins: [
    PureRenderMixin
  ],

  render: function() {
    return <Wrapper tree={tree} location={this.props.location}>{this.props.children}</Wrapper>;
  }
});
