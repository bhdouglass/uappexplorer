var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var If = require('../helpers/if');

module.exports = React.createClass({
  displayName: 'Hearts',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    hearts: React.PropTypes.number,
    popularity: React.PropTypes.number,
    pop: React.PropTypes.bool,
  },

  render: function() {
    return (
      <span>
        <If value={this.props.pop} element="span">
          <span className={(this.props.popularity > 0) ? 'heart-rating text-danger' : 'heart-rating'} title={i18n.t('Monthly Popularity')}>
            <i className={(this.props.popularity > 0) ? 'fa fa-fire' : 'fa fa-fire-extinguisher'}></i> {this.props.popularity ? this.props.popularity : 0}
          </span>
        </If>

        <If value={!this.props.pop} element="span">
          <span className="text-danger heart-rating" title={i18n.t('Heart Rating')}>
            <i className={(this.props.hearts > 0) ? 'fa fa-heart' : 'fa fa-heart-o'}></i> {this.props.hearts ? this.props.hearts : 0}
          </span>
        </If>
      </span>
    );
  }
});
