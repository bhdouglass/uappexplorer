var React = require('react');
var mixins = require('baobab-react/mixins');
var Link = require('react-router').Link;
var actions = require('../actions');
var utils = require('../utils');
var Types = require('./appinfo/types');
var Stars = require('./appinfo/stars');
var Hearts = require('./appinfo/hearts');
var AppCell = require('./appinfo/appCell');

module.exports = React.createClass({
  displayName: 'App',
  mixins: [
    mixins.branch,
  ],
  cursors: {
    app: ['app'],
    loading: ['loading'],
  },

  getInitialState: function() {
    return {
      tab: 'description',
    };
  },

  componentWillMount: function() {
    actions.getApp(this.props.params.name);
  },

//TODO swipe to navigate
/*
<div className="previous-app" ng-if="previous_app" ng-hide="slideOutLeft || slideOutRight">
  <a ng-click="previous()" title="{{'Previous App:'|translate}} {{previous_app.title}}" className="text-material-grey clickable">
    <i className="fa fa-2x fa-chevron-left"></i>
  </a>
</div>

<div className="next-app" ng-if="next_app" ng-hide="slideOutLeft || slideOutRight">
  <a ng-click="next()" title="{{'Next App:'|translate}} {{next_app.title}}" className="text-material-grey clickable">
    <i className="fa fa-2x fa-chevron-right"></i>
  </a>
</div>
*/

//TODO separate component for this
/*
<p className="list-group-item-text external-links row">
  <!-- The display block is to override the styles set by an adblocker. Some people actually want to be able to use an adblocker and still share to social media -->
  <div className="col-sm-2 col-xs-4">
    <a ng-href="https://plus.google.com/share?url={{url}}app/{{app.name}}" className="text-material-red" title="Share on Google" style="display:block !important;">
      <i className="fa fa-gps fa-3x"></i>
    </a>
  </div>
  <div className="col-sm-2 col-xs-4">
    <a ng-href="http://www.facebook.com/sharer/sharer.php?u={{url}}app/{{app.name}}" className="text-material-blue" title="Share on Facebook" style="display:block !important;">
      <i className="fa fa-fs fa-3x"></i>
    </a>
  </div>
  <div className="col-sm-2 col-xs-4">
    <a ng-href="https://twitter.com/intent/tweet?text={{app.title}}&url={{url}}app/{{app.name}}&via=uappexplorer" className="text-material-lightblue" title="Share on Twitter" style="display:block !important;">
      <i className="fa fa-ts fa-3x"></i>
    </a>
  </div>
  <div className="clear-fix visible-xs"></div>
  <div className="col-sm-2 col-xs-4">
    <a ng-href="https://www.reddit.com/submit?url={{url}}app/{{app.name}}" className="text-material-cyan" title="Share on Reddit" style="display:block !important;">
      <i className="fa fa-rs fa-3x"></i>
    </a>
  </div>
  <div className="col-sm-2 col-xs-4">
    <a className="text-material-grey caxton-button clickable" title="Send via Caxton" ng-click="caxton()">
      <i className="fa fa-square fa-3x"></i>
      <img src="/img/caxton.svg" ng-show="!caxtonSent" title="Send via Caxton" />
      <i className="fa fa-check fa-2x fa-inverse" ng-show="caxtonSent" title="Sent via Caxton"></i>
    </a>
  </div>
  <div className="col-sm-2 col-xs-4">
    <a className="text-material-lightgreen qr-button clickable" title="QR Code" onClick={this.qrCode}>
      <i className="fa fa-square fa-3x"></i>
      <i className="fa fa-qrcode fa-2x fa-inverse"></i>
    </a>
  </div>
</p>
*/

  renderAuthorInfo: function() {
    var author = '';
    if (this.state.app.author) {
      var query = {q: 'author:' + this.state.app.author};

      author = (
        <div>
          <Link to="/apps" query={query} title="Author" className="clickable">{this.state.app.author}</Link>
        </div>
      );
    }

    var company = '';
    if (this.state.app.company) {
      company = (
        <div>
          <span title="Company">{this.state.app.company}</span>
        </div>
      );
    }

    return (
      <div>
        {author}
        {company}
      </div>
    );
  },

  renderPrice: function() {
    var p = '';
    if (utils.isFree(this.state.app.prices)) {
      p = <span className="label label-material-blue">Free</span>;
    }
    else {
      p = [];
      for (var currency in this.state.app.prices) {
        var price = utils.price(this.state.app.prices, currency);
        p.push(<span  className="label label-material-green price" key={currency}>{price}</span>);
      }
    }

    return p;
  },

  renderDownload: function() {
    var download = '';
    if (this.state.app.types.indexOf('snappy') == -1) {
      var warning = '';
      var cls = 'btn btn-sm btn-material-green';
      if (this.state.app.webapp_inject) {
        cls = 'btn btn-sm btn-material-red';
        warning = (
          <div className="small-note text-material-red">
            *This webapp injects custom code into the website which can add extra features or be malicious. Only use this app if you trust the author.
          </div>
        );
      }

      var link = 'scope://com.canonical.scopes.clickstore?q=' + this.state.app.title;
      download = (
        <div className="list-group-item-text">
          <a href={link} className={cls}>Install</a>
          <div className="small-note">
            *Install will take you to the official appstore on an Ubuntu Touch device
          </div>
          {warning}
        </div>
      );
    }
    else {
      download = (
        <div className="list-group-item-text">
          <a href={this.state.app.download} className="btn btn-sm btn-success">Download</a>
        </div>
      );
    }

    return download;
  },

  renderLists: function() {
    //TODO
    /*
    <div ng-show="loggedin">
      <div className="list-group-item">
        <div className="row-action-primary">
            <div className="action-icon ubuntu-shape">
              <i className="fa fa-list-ul" ng-style="strToColor(app.title, 'background-color')"></i>
            </div>
        </div>

        <div className="row-content">
          <div className="list-group-item-text">
            <div ng-if="lists.length > 0">
              <span translate>Add to list:</span>
              <select className="form-control" ng-options="l._id as l.name for l in lists" ng-model="list" ng-change="addToList(list)">
                <option value="" translate>- Choose a list -</option>
              </select>
            </div>

            <div ng-if="lists.length == 0 && appLists.length == 0">
              <a href="/me" translate>No lists, create one!</a>
            </div>

            <br/>
            <p ng-if="appLists.length > 0">
              <span translate>This app is on these lists:</span>
              <a className="label label-success list-label" ng-repeat="list in appLists" ng-href="/list/{{list._id}}" ng-bind="list.name"></a>
            </p>
          </div>
        </div>

      </div>
      <div className="list-group-separator"></div>
    </div>
    </div>
    */
  },

  changeTab: function(tab) {
    if (tab != this.state.tab) {
      this.setState({tab: tab});
    }
  },

  renderTabs: function() {
    var tabs = {
      'description': 'clickable',
      'changelog': 'clickable',
      'info': 'clickable',
      'support': 'clickable',
    };
    var inner_tabs = {
      'description': '',
      'changelog': '',
      'info': '',
      'support': '',
    };

    tabs[this.state.tab] = 'clickable active';
    inner_tabs[this.state.tab] = 'background-material-light-blue';

    var tab = '';
    if (this.state.tab == 'description') {
      tab = <div dangerouslySetInnerHTML={utils.nl2br(this.state.app.description)}></div>;
    }
    else if (this.state.tab == 'changelog') {
      var changelog = this.state.app.changelog;
      if (!changelog) {
        changelog = 'No recent changes';
      }
      tab = <div dangerouslySetInnerHTML={utils.nl2br(changelog)}></div>;
    }
    else if (this.state.tab == 'info') {
      //TODO updated as nice date
      tab = (
        <div>
          Version: {this.state.app.version}
          <br/>
          Updated: {this.state.app.last_updated}
          <br/>
          License: {this.state.app.license}
          <br/>
          Architecture: {this.state.app.architecture.join(', ')}
        </div>
      );
    }
    else if (this.state.tab == 'support') {
      var support = '';
      if (this.state.app.support) {
        if (this.state.app.support.indexOf('mailhide') > -1) {
          support = (
            <span>
              Support: <a href={this.state.app.support} target="_blank" rel="nofollow">Email Support</a>
            </span>
          );
        }
        else {
          support = (
            <span>
              Support: <a href={this.state.app.support} target="_blank" rel="nofollow">{this.state.app.support}</a>
            </span>
          );
        }
      }

      var website = '';
      if (this.state.app.website) {
        website = (
          <span>
            <br/>
            Website: <a href={this.state.app.website} rel="nofollow">{this.state.app.website}</a>
          </span>
        );
      }

      var terms = '';
      if (this.state.app.terms) {
        terms = (
          <span>
            <br/>
            Terms:
            <div>{this.state.app.terms}</div>
          </span>
        );
      }

      tab = (
        <div>
          {support}
          {website}
          {terms}
        </div>
      );
    }

    return (
      <div className="col-md-6">
        <ul className="nav nav-pills">
          <li className={tabs.description}>
            <a onClick={this.changeTab.bind(this, 'description')} className={inner_tabs.description}>Description</a>
          </li>
          <li className={tabs.changelog}>
            <a onClick={this.changeTab.bind(this, 'changelog')} className={inner_tabs.changelog}>Changelog</a>
          </li>
          <li className={tabs.info}>
            <a onClick={this.changeTab.bind(this, 'info')} className={inner_tabs.info}>Info</a>
          </li>
          <li className={tabs.support}>
            <a onClick={this.changeTab.bind(this, 'support')} className={inner_tabs.support}>Support</a>
          </li>
        </ul>

        <div className="tab-content">
          <div className="well app-tab">
            {tab}
          </div>
        </div>
      </div>
    );
  },

  renderScreenshots: function() {
    var screenshots = '';
    if (this.state.app.screenshots.length > 0 && this.state.app.screenshots[0] !== '') {
      screenshots = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h3>Screenshots</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 screenshot-scroll">
              {this.state.app.screenshots.map(function(screenshot) {
                return (
                  <div key={screenshot}>
                    <a href={screenshot} className="swipebox" rel="nofollow">
                      <img src={screenshot} alt="" className="screenshot" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return screenshots;
  },

  renderApps: function(type) {
    var apps = [];
    if (type == 'author') {
      apps = this.state.app.author_apps ? this.state.app.author_apps : [];
    }
    else {
      apps = this.state.app.related_apps ? this.state.app.related_apps : [];
    }

    var aa = '';
    if (apps.length > 0) {
      var header = '';
      if (type == 'author') {
        var query = {q: 'author:' + this.state.app.author};
        header = <Link to="/apps" query={query}>More Apps by {this.state.app.author}</Link>;
      }
      else {
        header = 'Similar Apps';
      }

      aa = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h3>{header}</h3>
            </div>
          </div>

          <div className="row grid-view">
            {apps.map(function(app, index, arr) {
              var cls = 'col-md-4 col-xs-6';
              if (index == (arr.length - 1) && arr.length == 3) {
                cls = 'col-md-4 col-xs-6 hidden-xs hidden-sm';
              }
              else if (index === 0 && arr.length == 2) {
                cls = 'col-md-4 col-xs-6 col-md-offset-2';
              }
              else if (arr.length == 1) {
                cls = 'col-md-4 col-xs-6 col-md-offset-4 col-xs-offset-3';
              }

              return (
                <div className={cls} key={app.name}>
                  <AppCell app={app} description={false} />
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    //TODO AppCell.popularity

    return aa;
  },

  renderReviews: function() {
    //TODO
    /*
    <div className="row">
      <div className="col-md-12 text-center">
        <h3>User Reviews</h3>
      </div>
    </div>

    <div className="row">
      <div className="col-md-12 text-center" ng-if="app.loading_reviews">
        <i className="fa fa-spin fa-spinner fa-2x"></i>
        <span translate>Loading reviews...</span>
      </div>

      <div className="col-md-12">
        <div className="row star-chart text-center" ng-show="app.reviews.length > 0">
          <div className="col-sm-2 col-sm-offset-3 left-panel">
            <div className="text-primary text-large text-center">
              <i className="fa fa-star"></i>
              <span ng-bind="app.bayesian_average.toFixed(2)"></span>
            </div>

            <span className="text-danger text-med-large heart-rating">
              <i className="fa" ng-className="{'fa-heart-o': !app.points || app.points <= 0, 'fa-heart': app.points > 0}"></i>
              <span ng-bind="app.points || 0"></span>
            </span>

            <br/>
            <i className="fa fa-users"></i>
            <span ng-bind="app.review_stats.total"></span>
          </div>
          <div className="col-sm-3 right-panel">
            <span className="pull-left">5 <i className="fa fa-star"></i></span>
            <div className="progress">
              <div className="progress-bar progress-bar-material-lightgreen" ng-style="stats(5)" ng-bind="app.review_stats[5]"></div>
            </div>
            <span className="pull-left">4 <i className="fa fa-star"></i></span>
            <div className="progress">
              <div className="progress-bar progress-bar-material-lime" ng-style="stats(4)" ng-bind="app.review_stats[4]"></div>
            </div>
            <span className="pull-left">3 <i className="fa fa-star-half-o"></i></span>
            <div className="progress">
              <div className="progress-bar progress-bar-material-lightyellow" ng-style="stats(3)" ng-bind="app.review_stats[3]"></div>
            </div>
            <span className="pull-left">2 <i className="fa fa-star-o"></i></span>
            <div className="progress">
              <div className="progress-bar progress-bar-material-orange" ng-style="stats(2)" ng-bind="app.review_stats[2]"></div>
            </div>
            <span className="pull-left">1 <i className="fa fa-star-o"></i></span>
            <div className="progress">
              <div className="progress-bar progress-bar-material-deeporange" ng-style="stats(1)" ng-bind="app.review_stats[1]"></div>
            </div>
          </div>
        </div>
      </div>

      <div ng-repeat="review in app.reviews|orderBy:'-date_created'" className="review">
        <div className="col-md-4 col-sm-6" ng-className="{'col-md-offset-4': ($last && (app.reviews.length % 3) == 1), 'col-md-offset-2': (($index + 2) == app.reviews.length && (app.reviews.length % 3) == 2)}">
          <div className="list-group">
            <div className="list-group-item">
              <div className="row-action-primary">
                <div className="action-icon ubuntu-shape">
                  <i className="fa fa-user" ng-style="strToColor(review.reviewer_username, 'background-color')"></i>
                </div>
              </div>

              <div className="row-content">
                <div className="least-content" ng-bind="review.date_created|date"></div>

                <p className="list-group-item-heading">
                  <stars ng-model="review.rating"></stars>
                </p>

                <p className="list-group-item-text review-author">
                  <span ng-bind="review.reviewer_displayname"></span>
                </p>
              </div>
                <p className="list-group-item-text review-text">
                  <span ng-bind="review.review_text"></span>
                  <br/>
                  <span translate translate-comment="Comment below reviews">For version:</span> <span ng-bind="review.version"></span>
                </p>
            </div>
          </div>
        </div>

        <div className="hidden-xs hidden-sm" ng-className="{clearfix: $index % 3 == 2}"></div>
        <div className="visible-xs visible-sm" ng-className="{clearfix: $index % 2 == 1}"></div>

        <div className="separator hidden-xs hidden-sm" ng-show="$index % 3 == 2"></div>
        <div className="separator visible-sm" ng-show="$index % 2 == 1"></div>
        <div className="separator visible-xs"></div>
      </div>

      <div className="col-sm-4 col-md-offset-4 text-center" ng-show="!app.loading_reviews && (!app.reviews || app.reviews.length == 0)">
        <h4 translate>No reviews yet!</h4>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-12 text-center" ng-show="app.more_reviews">
        <a ng-click="loadMoreReview(app)" ng-if="!app.loading_more_reviews" className="btn btn-info">Load more reviews</a>
        <span ng-if="app.loading_more_reviews">
          <i className="fa fa-spin fa-spinner"></i>
          <span translate>Loading more reviews...</span>
        </span>
      </div>
    </div>
    */
  },

  renderMain: function() {
    var component = '';
    if (!this.state.loading && this.state.app && this.state.app.name == this.props.params.name) {
      var download_style = utils.strToColor(this.state.app.author, 'backgroundColor');
      var share_cls = utils.strToColor(this.state.app.name, 'backgroundColor');

      component = (
        <div className="swipe-container">
          <div className="row">
            <div className="col-md-6">
              <div className="list-group">
                <div className="list-group-item">
                  <div className="row-action-primary">
                    <div className="icon-large ubuntu-shape">
                      <img src={this.state.app.icon} alt={this.state.app.name} />
                    </div>
                  </div>

                  <div className="row-content app-info">
                    <div className="least-content hidden-xs">
                      <Types types={this.state.app.types} />
                    </div>
                    <h4 className="list-group-item-heading">{this.state.app.title}</h4>
                    <div className="list-group-item-text">
                      <Stars stars={this.state.app.bayesian_average} />
                      <Hearts hearts={this.state.app.points} />

                      {this.renderAuthorInfo()}

                      {this.renderPrice()}

                      <span className="pull-right visible-xs">
                        <Types types={this.state.app.types} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="list-group-separator"></div>

                <div className="list-group-item">
                  <div className="row-action-primary">
                      <div className="action-icon ubuntu-shape">
                        <i className="fa fa-download" style={download_style}></i>
                      </div>
                  </div>

                  <div className="row-content">
                    {this.renderDownload()}
                  </div>

                </div>
                <div className="list-group-separator"></div>

                <div className="list-group-item">
                  <div className="row-action-primary">
                      <div className="action-icon ubuntu-shape">
                        <i className="fa fa-sa" style={share_cls}></i>
                      </div>
                  </div>

                  <div className="row-content">
                    TODO: share options
                  </div>

                </div>
                <div className="list-group-separator"></div>

                {this.renderLists()}
              </div>
            </div>

            {this.renderTabs()}
          </div>

          {this.renderScreenshots()}
          {this.renderApps('author')}
          {this.renderApps('similar')}

          {this.renderReviews()}
        </div>
      );
    }

    return component;
  },

  render: function() {
    var loading = '';
    if (this.state.loading) {
      loading = (
        <div className="row">
          <div className="col-md-12 text-center">
            <i className="fa fa-spinner fa-spin fa-4x"></i>
          </div>
        </div>
      );
    }

    return (
      <div className="app">
        {loading}

        {this.renderMain()}
      </div>
    );
  }
});
