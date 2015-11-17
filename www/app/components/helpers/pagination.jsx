var React = require('react');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');

module.exports = React.createClass({
  displayName: 'Pagination',
  mixins: [
    PureRenderMixin
  ],
  props: {
    total: React.PropTypes.number.isRequired,
    active: React.PropTypes.number.isRequired,
    base: React.PropTypes.string.isRequired,
    query: React.PropTypes.object,
  },

  renderButton: function(title, page, cls) {
    var query = JSON.parse(JSON.stringify(this.props.query)); //deep copy
    query.page = page;

    if (query.page <= 0) {
      query.page = undefined;
    }

    return (
      <li className={cls} key={title}>
        <Link to={this.props.base} query={query}>{title}</Link>
      </li>
    );
  },

  render: function() {
    var component = <div></div>;
    if (this.props.total > 1) {
      var buttons = [];

      var previous = 'clickable';
      if (this.props.active === 0) {
        previous = 'disabled';
      }
      buttons.push(this.renderButton('<', this.props.active - 1, previous));

      var start = this.props.active - 1;
      if (start < 0) {
        start = 0;
      }

      if (start + 3 > this.props.total) {
        start = this.props.total - 3;
      }

      if (start < 0) {
        start = 0;
      }

      if (start > 0) {
        buttons.push(this.renderButton('1', 0, 'clickable hidden-xs'));
        buttons.push(
          <li className="hidden-xs disabled" key="hellip1">
            <a>&hellip;</a>
          </li>
        );
      }

      var last = 0;
      for (var i = start; i < this.props.total && i < start + 3; i++) {
        var cls = 'clickable';
        if (i == this.props.active) {
          cls = 'active';
        }

        buttons.push(this.renderButton(i + 1, i, cls));
        last = i;
      }

      if (last != (this.props.total - 1)) {
        buttons.push(
          <li className="hidden-xs disabled" key="hellip2">
            <a>&hellip;</a>
          </li>
        );
        buttons.push(this.renderButton(this.props.total, this.props.total - 1, 'clickable hidden-xs'));
      }

      var next = 'clickable';
      if (this.props.active == (this.props.total - 1)) {
        next = 'disabled';
      }
      buttons.push(this.renderButton('>', this.props.active + 1, next));

      component = (
        <div className="row">
          <div className="col-md-12">
            <nav className="center">
              <ul className="pagination pagination-lg">
                {buttons}
              </ul>
            </nav>
          </div>
        </div>
      );
    }

    return component;
  }
});
