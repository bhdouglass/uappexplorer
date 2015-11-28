var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

module.exports = React.createClass({
  displayName: 'Stars',
  mixins: [
    PureRenderMixin
  ],
  props: {
    stars: React.PropTypes.number.isRequired,
  },

  render: function() {
    var prop_stars = this.props.stars ? this.props.stars : 0;
    var title = (Math.round(prop_stars * 100) / 100) + ' / 5';
    var stars = Math.round(prop_stars * 2) / 2; //round to nearest 1/2
    var full = Math.floor(stars);
    var empty = 5 - Math.ceil(stars);
    var half = 5 - full - empty;

    var full_icons = [];
    var half_icons = [];
    var empty_icons = [];

    for (var i = 0; i < full; i++) {
      var key_full = 'full' + i;
      full_icons.push(<i className="fa fa-star" key={key_full}></i>);
    }

    for (var j = 0; j < half; j++) {
      var key_half = 'half' + j;
      half_icons.push(<i className="fa fa-star-half-o" key={key_half}></i>);
    }

    for (var k = 0; k < empty; k++) {
      var key_empty = 'empty' + k;
      empty_icons.push(<i className="fa fa-star-o" key={key_empty}></i>);
    }

    return (
      <span className="text-material-light-blue" title={title}>
        {full_icons}
        {half_icons}
        {empty_icons}
      </span>
    );
  }
});
