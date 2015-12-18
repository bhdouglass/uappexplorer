var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var If = require('./helpers/if');

module.exports = React.createClass({
  displayName: 'Wish',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    wish: ['wish'],
    lng: ['lng'],
  },

  componentWillMount: function() {
    actions.getWish(this.props.params.id);
  },

  componentWillUpdate: function(nextProps) {
    if (this.props.params.id != nextProps.params.id) {
      actions.getWish(nextProps.params.name);
    }
  },

  render: function() {
    var style = {display: 'inline-block !important'};
    var loading = (this.state.wish && this.props.params.id != this.state.wish.id);
    var pretty_other_link = '';
    if (this.state.wish && this.state.wish.other_link) {
      pretty_other_link = this.state.wish.other_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '');
    }

    return (
      <div className="wish">
        <If value={loading}>
          <div className="row">
            <div className="col-md-12 text-center">
              <i className="fa fa-spinner fa-spin fa-4x"></i>
            </div>
          </div>
        </If>

        <If value={!loading}>
          <div className="text-center">
            {i18n.t("I'm wishing for...")}
            <h2 className="list-group-item-heading word-break">{this.state.wish.name}</h2>
            {i18n.t('Submitted by')}: {this.state.wish.wisher}

            <If value={this.state.wish.developer}>
              {i18n.t('Developer/Company')}: {this.state.wish.developer}
            </If>
          </div>

          <div className="text-center">
            <If value={this.state.wish.existing}>
              <If value={this.state.wish.google_play_link} element="span">
                <a href={this.state.wish.google_play_link} rel="nofollow" className="btn btn-success">
                  <i className="fa fa-google" style={style}></i> {i18n.t('Google Play Link')}
                </a>
              </If>
              <If value={this.state.wish.amazon_link} element="span">
                <a href={this.state.wish.amazon_link} rel="nofollow" className="btn btn-material-red">
                  <i className="fa fa-amazon" style={style}></i> {i18n.t('Amazon Link')}
                </a>
              </If>
              <If value={this.state.wish.itunes_link} element="span">
                <a href={this.state.wish.itunes_link} rel="nofollow" className="btn btn-material-light-blue">
                  <i className="fa fa-apple" style={style}></i> {i18n.t('iTunes Link')}
                </a>
              </If>
              <If value={this.state.wish.other_link}>
                <a href={this.state.wish.other_link} rel="nofollow" className="btn btn-material-deep-orange">
                  <i className="fa fa-external-link"></i> {i18n.t('Other Link')}
                  <div className="other-link">{pretty_other_link}</div>
                </a>
              </If>
            </If>
          </div>
        </If>
      </div>
    );
  }
});
