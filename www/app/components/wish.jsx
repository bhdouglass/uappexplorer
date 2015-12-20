var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var If = require('./helpers/if');
var Share = require('./helpers/share');
var WishUpvote = require('./modals/wishUpvote');

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

  vote: function(direction) {
    if (direction == 'up') {
      this.setState({show: true});
    }
    else {
      actions.voteWish(this.state.wish.id, 'down', false);
    }
  },

  upvote: function(price) {
    this.setState({show: false});

    if (price !== false) {
      actions.voteWish(this.state.wish.id, 'up', price);
    }
  },

  render: function() {
    var style = {display: 'inline-block !important'};
    var loading = (this.state.wish && this.props.params.id != this.state.wish.id);
    var pretty_other_link = '';
    if (this.state.wish && this.state.wish.other_link) {
      pretty_other_link = this.state.wish.other_link.replace(/http:\/\//i, '').replace(/https:\/\//i, '');
    }

    var share_title = i18n.t("I'm wishing for: ") + this.state.wish.name;
    var url = window.location.protocol + '://' + window.location.host + '/wishlist/' + this.state.wish.id;

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
          <div className="row">
            <div className="col-md-2 votes text-center">
              <a onClick={this.vote.bind(this, 'up')} className="btn btn-material-light-green upvotes" title={i18n.t('Upvote')}>
                <i className="fa fa-chevron-up"></i> {this.state.wish.upvotes}
              </a>

              <a onClick={this.vote.bind(this, 'down')} className="btn btn-material-red" title={i18n.t('Downvote')}>
                <i className="fa fa-chevron-down"></i> {this.state.wish.downvotes}
              </a>
            </div>

            <div className="col-md-6">
              {i18n.t("I'm wishing for...")}
              <h1 className="title">{this.state.wish.name}</h1>
              {i18n.t('Submitted by')}: {this.state.wish.wisher}

              <If value={this.state.wish.developer}>
                {i18n.t('Developer/Company')}: {this.state.wish.developer}
              </If>

              <If value={this.state.wish.existing}>
                <If value={this.state.wish.google_play_link} element="span">
                  <a href={this.state.wish.google_play_link} rel="nofollow" className="btn btn-sm btn-success">
                    <i className="fa fa-fw fa-google fa-2x" style={style} title={i18n.t('Google Play Link')}></i>
                  </a>
                </If>
                <If value={this.state.wish.amazon_link} element="span">
                  <a href={this.state.wish.amazon_link} rel="nofollow" className="btn btn-sm btn-material-red">
                    <i className="fa fa-fw fa-amazon fa-2x" style={style} title={i18n.t('Amazon Link')}></i>
                  </a>
                </If>
                <If value={this.state.wish.itunes_link} element="span">
                  <a href={this.state.wish.itunes_link} rel="nofollow" className="btn btn-sm btn-material-light-blue">
                    <i className="fa fa-fw fa-apple fa-2x" style={style} title={i18n.t('iTunes Link')}></i>
                  </a>
                </If>

                <If value={this.state.wish.other_link}>
                  {i18n.t('More Info')}: <a href={this.state.wish.other_link} rel="nofollow">
                    {pretty_other_link}
                  </a>
                </If>
              </If>

              <br/>
            </div>

            <div className="col-md-4">
              <h4 className="pull-right hidden-sm hidden-xs">{i18n.t('Help this wish get more votes!')}</h4>
              <div className="clearfix"></div>
              <Share url={url} title={share_title} />
            </div>
          </div>
        </If>

        <br/>

        <WishUpvote show={this.state.show} onHide={this.upvote} />
      </div>
    );
  }
});
