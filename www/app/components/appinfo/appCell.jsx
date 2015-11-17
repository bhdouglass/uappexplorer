var React = require('react');
var Link = require('react-router').Link;

var utils = require('../../utils');
var Types = require('./types');
var Stars = require('./stars');
var Hearts = require('./hearts');

module.exports = React.createClass({
  displayName: 'AppCell',
  props: {
    app: React.PropTypes.object.isRequired,
    popularity: React.PropTypes.boolean,
    description: React.PropTypes.boolean,
    onClick: React.PropTypes.function,
    editable: React.PropTypes.boolean,
    onRemoveClick: React.PropTypes.function,
  },

  handleRemoveClick: function(app, event) {
    if (this.props.editable && this.props.onRemoveClick) {
      event.preventDefault();
      event.stopPropagation();

      this.props.onRemoveClick(app);
    }
  },

  handleClick: function(event) {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  },

  renderPrice: function() {
    var price = utils.price(this.props.app.prices);
    var cls = 'label label-material-green';
    if (utils.isFree(this.props.app.prices)) {
      cls = 'label label-material-deep-orange';
    }

    return (
      <div className={cls}>{price}</div>
    );
  },

  renderDescription: function() {
    var desc = '';
    if (this.props.description) {
      desc = <p className="list-group-item-text">{this.props.app.tagline}</p>;
    }

    return desc;
  },

  render: function() {
    var url = '/app/' + this.props.app.name;

    var remove = '';
    if (this.props.editable && this.props.onRemoveClick) {
      remove = (
        <span onClick={this.handleRemoveClick.bind(this, this.props.app)} className="clickable top-right" title="Remove this app from your list">
          <i className="fa fa-close"></i>
        </span>
      );
    }

    return (
      <div className="list-group app-view">
        <Link className="list-group-item clickable" to={url} title={this.props.app.tagline} onClick={this.handleClick}>
          <div className="row-action-primary">
            <div className="icon ubuntu-shape">
              <img src={this.props.app.icon} alt={this.props.app.name} />
            </div>
          </div>

          <div className="row-content">
            <div className="least-content">
              <Types types={this.props.app.types} />
            </div>
            <div className="least-content-lower">
              {this.renderPrice()}
            </div>

            <h4 className="list-group-item-heading word-break">{this.props.app.title}</h4>
            <p className="list-group-item-text">
              <Stars stars={this.props.app.bayesian_average} />

              <Hearts hearts={this.props.app.points} popularity={this.props.app.monthly_popularity} pop={this.props.popularity} />
            </p>

            {this.renderDescription()}
            {remove}
          </div>
        </Link>
      </div>

    );
  }
});
