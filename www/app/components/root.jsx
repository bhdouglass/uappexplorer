var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var tree = require('../state');
var Main = require('./main');

module.exports = React.createClass({
  displayName: 'Root',
  mixins: [
    PureRenderMixin
  ],

  render: function() {
    return <Main tree={tree} location={this.props.location}>{this.props.children}</Main>;
  }
});
