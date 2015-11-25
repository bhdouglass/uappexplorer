var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

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
    pop: React.PropTypes.boolean,
  },

  renderHearts: function() {
    var cls = 'fa fa-heart-o';
    if (this.props.hearts > 0) {
      cls = 'fa fa-heart';
    }

    return (
      <span className="text-danger heart-rating" title={i18n.t('Heart Rating')}>
        <i className={cls}></i> {this.props.hearts ? this.props.hearts : 0}
      </span>
    );
  },

  renderPopularity: function() {
    var cls = 'fa fa-fire-extinguisher';
    var text_cls = 'heart-rating';
    if (this.props.popularity > 0) {
      cls = 'fa fa-fire';
      text_cls = 'heart-rating text-danger';
    }

    return (
      <span className={text_cls} title={i18n.t('Monthly Popularity')}>
        <i className={cls}></i> {this.props.popularity ? this.props.popularity : 0}
      </span>
    );
  },

  render: function() {
    var component = '';
    if (this.props.pop) {
      component = this.renderPopularity();
    }
    else {
      component = this.renderHearts();
    }

    return component;
  }
});
