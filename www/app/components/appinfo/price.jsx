var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var utils = require('../../utils');

module.exports = React.createClass({
  displayName: 'Price',
  mixins: [
    PureRenderMixin,
    mixins.branch,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    prices: React.PropTypes.object.isRequired,
    currency: React.PropTypes.string,
  },

  render: function() {
    var component = '';
    var price = 0;
    if (utils.isFree(this.props.prices)) {
      component = <span className="label label-material-deep-orange">{i18n.t('Free')}</span>;
    }
    else if (this.props.currency) {
      price = utils.price(this.props.prices, this.props.currency);
      component = <span className="label label-material-green">{price}</span>;
    }
    else {
      component = [];
      for (var currency in this.props.prices) {
        price = utils.price(this.props.prices, currency);
        component.push(<span className="label label-material-green price" key={currency}>{price}</span>);
      }
    }

    return <span>{component}</span>;
  }
});
