var React = require('react');

var types = {
  application: 'App',
  scope: 'Scope',
  webapp: 'Web App',
  snappy: 'Snappy App',
};

module.exports = React.createClass({
  displayName: 'Types',
  props: {
    types: React.PropTypes.array.isRequired,
  },

  renderType: function(type) {
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
  },

  render: function() {
    return (
      <span>
        {this.props.types.map(function(type) {
          return this.renderType(type);
        }, this)}
      </span>
    );
  }
});
