var React = require('react');
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
  },

  renderPrice: function() {
    var price = utils.price(this.props.app.prices);
    var cls = 'label label-primary';
    if (isNaN(parseInt(price))) {
      cls = 'label label-success';
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

    return (
      <div className="list-group app-view">
        <a className="list-group-item clickable" href={url} title={this.props.app.tagline}>
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

              <Hearts hearts={this.props.app.points} popularity="this.props.app.points.monthly_popularity" pop={this.props.popularity} />
            </p>

            {this.renderDescription()}
          </div>
        </a>
      </div>

    );
  }
});
