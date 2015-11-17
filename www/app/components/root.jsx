var React = require('react');

var tree = require('../state');
var Main = require('./main');

module.exports = React.createClass({
  displayName: 'Root',

  render: function() {
    return <Main tree={tree} location={this.props.location}>{this.props.children}</Main>;
  }
});
