var React = require('react');
var tree = require('../trees/state');
var Main = require('./main');

module.exports = React.createClass({
  displayName: 'Root',

  render: function() {
    return <Main tree={tree}>{this.props.children}</Main>;
  }
});
