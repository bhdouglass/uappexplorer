var React = require('react');
var moment = require('moment');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../../actions');
var utils = require('../../utils');
var Stars = require('./stars');
var Hearts = require('./hearts');
var If = require('../helpers/if');

module.exports = React.createClass({
  displayName: 'Reviews',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    reviews: ['reviews'],
    lng: ['lng'],
  },
  props: {
    name: React.PropTypes.string.isRequired,
    bayesian_average: React.PropTypes.number.isRequired,
    points: React.PropTypes.number.isRequired,
  },

  componentWillMount: function() {
    actions.getReviews(this.props.name, {limit: 9});
  },

  componentWillUpdate: function(nextProps) {
    if (this.props.name != nextProps.name) {
      actions.getReviews(nextProps.name, {limit: 9});
    }
  },

  stats: function(rating) {
    var width = 0;
    if (this.state.reviews && this.state.reviews.stats && this.state.reviews.stats.total > 0) {
      width = this.state.reviews.stats[rating] / this.state.reviews.stats.total * 100;
    }

    var style = {
      width: width + '%'
    };

    if (this.state.reviews && this.state.reviews.stats && this.state.reviews.stats[rating] === 0) {
      style.display = 'none';
    }

    return style;
  },

  loadMoreReviews: function() {
    var params = {
      limit: 9,
      skip: this.state.reviews.params.skip ? this.state.reviews.params.skip + 9 : 9,
    };

    actions.getReviews(this.props.name, params);
  },

  total: function(prop) {
    var t = 0;
    if (this.state.reviews && this.state.reviews.stats && this.state.reviews.stats[prop] !== undefined) {
      t = this.state.reviews.stats[prop];
    }

    return t;
  },

  render: function() {
    var reviews = [];
    if (this.state.reviews && this.state.reviews.loaded && this.state.reviews.name == this.props.name) {
      reviews = this.state.reviews.reviews;
    }

    return (
      <div>
        <If value={!this.state.reviews || !this.state.reviews.loaded}>
          <div className="row">
            <div className="col-md-12 text-center">
              <i className="fa fa-spin fa-spinner fa-2x"></i> {i18n.t('Loading reviews...')}
            </div>
          </div>
        </If>

        <If value={this.state.reviews && this.state.reviews.loaded && this.state.reviews.name == this.props.name}>
          <div>
            <div className="row">
              <div className="col-md-12 text-center">
                <h3>{i18n.t('User Reviews')}</h3>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="row star-chart text-center">
                  <div className="col-sm-2 col-sm-offset-3 left-panel">
                    <div className="text-material-light-blue text-large text-center" title={i18n.t('Star Rating')}>
                      <i className="fa fa-star"></i> {this.props.bayesian_average.toFixed(2)}
                    </div>

                    <Hearts hearts={this.props.points} />

                    <br/>
                    <span title={i18n.t('Total Reviews')}>
                      <i className="fa fa-users"></i> {this.total('total')}
                    </span>
                  </div>
                  <div className="col-sm-3 right-panel">
                    <span className="pull-left">5 <i className="fa fa-star"></i></span>
                    <div className="progress">
                      <div className="progress-bar progress-bar-material-light-green" style={this.stats(5)}>{this.total(5)}</div>
                    </div>
                    <span className="pull-left">4 <i className="fa fa-star"></i></span>
                    <div className="progress">
                      <div className="progress-bar progress-bar-material-lime" style={this.stats(4)}>{this.total(4)}</div>
                    </div>
                    <span className="pull-left">3 <i className="fa fa-star-half-o"></i></span>
                    <div className="progress">
                      <div className="progress-bar progress-bar-material-yellow" style={this.stats(3)}>{this.total(3)}</div>
                    </div>
                    <span className="pull-left">2 <i className="fa fa-star-o"></i></span>
                    <div className="progress">
                      <div className="progress-bar progress-bar-material-orange" style={this.stats(2)}>{this.total(2)}</div>
                    </div>
                    <span className="pull-left">1 <i className="fa fa-star-o"></i></span>
                    <div className="progress">
                      <div className="progress-bar progress-bar-material-deep-orange" style={this.stats(1)}>{this.total(1)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {reviews.map(function(review, index, arr) {
                var cls = 'col-md-4 col-sm-6';
                if (index == (arr.length - 1) && (arr.length % 3) == 1) {
                  cls += ' col-md-offset-4';
                }
                else if ((index + 2) == arr.length && (arr.length % 3) == 2) {
                  cls += ' col-md-offset-2';
                }

                return (
                  <div className="review" key={review.reviewer_username + review.id}>
                    <div className={cls}>
                      <div className="list-group">
                        <div className="list-group-item">
                          <div className="row-action-primary">
                            <div className="action-icon ubuntu-shape">
                              <i className="fa fa-user" style={utils.strToColor(review.reviewer_username, 'backgroundColor')}></i>
                            </div>
                          </div>

                          <div className="row-content">
                            <div className="least-content">{moment(review.date_created).format('MMM D, YYYY')}</div>

                            <div className="list-group-item-heading">
                              <Stars stars={review.rating} />
                            </div>

                            <div className="list-group-item-text review-author">
                              {review.reviewer_displayname}
                            </div>
                          </div>
                            <div className="list-group-item-text review-text">
                              {review.review_text}
                              <br/>
                              {i18n.t('For version:')} {review.version}
                            </div>
                        </div>
                      </div>
                    </div>

                    {(function() {
                      var clearfix = '';
                      if ((index % 3) == 2) {
                        clearfix = <div className="hidden-xs hidden-sm clearfix"></div>;
                      }
                      else if ((index % 2) == 1) {
                        clearfix = <div className="visible-xs visible-sm clearfix"></div>;
                      }

                      return clearfix;
                    }).bind(this)()}

                    {(function() {
                      var separator = '';
                      if ((index % 3) == 2) {
                        separator = <div className="separator hidden-xs hidden-sm"></div>;
                      }
                      else if ((index % 2) == 1) {
                        separator = <div className="separator visible-sm"></div>;
                      }

                      return separator;
                    }).bind(this)()}

                    <div className="separator visible-xs"></div>
                  </div>
                );
              })}

              <If value={reviews.length === 0}>
                <div className="col-sm-4 col-md-offset-4 text-center">
                  <h4>{i18n.t('No reviews yet!')}</h4>
                </div>
              </If>
            </div>

            <If value={this.state.reviews.more}>
              <div className="row">
                <div className="col-sm-12 text-center">
                  <a onClick={this.loadMoreReviews} className="btn btn-info">{i18n.t('Load more reviews')}</a>
                </div>
              </div>
            </If>
          </div>
        </If>
      </div>
    );
  }
});
