var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var Types = require('./types');
var Stars = require('./stars');
var Hearts = require('./hearts');
var Price = require('./price');
var If = require('../helpers/if');

module.exports = React.createClass({
  displayName: 'AppCell',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    app: React.PropTypes.object.isRequired,
    popularity: React.PropTypes.bool,
    description: React.PropTypes.bool,
    onClick: React.PropTypes.function,
    editable: React.PropTypes.bool,
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

  render: function() {
    var url = '/app/' + this.props.app.name;
    if (this.props.app.isSnap) {
      url = '/snap/' + this.props.app.store + '/' + this.props.app.name;
    }

    var types = this.props.app.types ? this.props.app.types : [this.props.app.type];

    return (
      <div className="list-group app-view">
        <Link className="list-group-item clickable" to={url} title={this.props.app.tagline} onClick={this.handleClick}>
          <div className="row-action-primary">
            <div className="icon ubuntu-shape">
              <img src={this.props.app.icon} alt={this.props.app.name} />
              <If value={this.props.app.store == 'openstore'} className="openstore-tag label label-material-light-blue">OpenStore</If>
            </div>
          </div>

          <div className="row-content">
            <div className="least-content">
              <Types types={types} isSnap={this.props.app.isSnap} />
            </div>
            <div className="least-content-lower">
              <Price prices={this.props.app.prices} currency="USD" />
            </div>

            <h4 className="list-group-item-heading word-break">{this.props.app.title}</h4>
            <div className="list-group-item-text">
              <If value={this.props.app.bayesian_average} element="span">
                <Stars stars={this.props.app.bayesian_average} />

                <Hearts hearts={this.props.app.points} popularity={this.props.app.monthly_popularity} pop={this.props.popularity} />
              </If>
            </div>

            <If value={this.props.description}>
              <div className="list-group-item-text">{this.props.app.tagline}</div>
            </If>

            <If value={this.props.editable && this.props.onRemoveClick}>
              <span onClick={this.handleRemoveClick.bind(this, this.props.app)} className="clickable top-right" title={i18n.t('Remove this app from your list')}>
                <i className="fa fa-close"></i>
              </span>
            </If>
          </div>
        </Link>
      </div>

    );
  }
});
