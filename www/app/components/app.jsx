var React = require('react');
var Router = require('react-router');
var moment = require('moment');
var mixins = require('baobab-react/mixins');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');
var Swipeable = require('react-swipeable');
var i18n = require('i18next-client');

var actions = require('../actions');
var utils = require('../utils');
var Types = require('./appinfo/types');
var Stars = require('./appinfo/stars');
var Hearts = require('./appinfo/hearts');
var Price = require('./appinfo/price');
var AppRow = require('./appinfo/appRow');
var Reviews = require('./appinfo/reviews');
var Share = require('./helpers/share');
var If = require('./helpers/if');

module.exports = React.createClass({
  displayName: 'App',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    app: ['app'],
    loading: ['loading'],
    userLists: ['userLists'],
    previousApp: ['previousApp'],
    nextApp: ['nextApp'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      tab: 'description',
      swipe: null,
    };
  },

  componentWillMount: function() {
    actions.getApp(this.props.params.name);
    actions.previousApp(this.props.params.name);
    actions.nextApp(this.props.params.name);
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (nextState.app && nextState.app.name) {
      actions.setOG({
        title: nextState.app.name,
        description: nextState.app.short_description,
        image: nextState.app.image,
      });
    }

    if (this.props.params.name != nextProps.params.name) {
      actions.getApp(nextProps.params.name);
      actions.previousApp(nextProps.params.name);
      actions.nextApp(nextProps.params.name);
    }
  },

  changeList: function(event) {
    for (var i = 0; i < this.state.userLists.lists.length; i++) {
      if (this.state.userLists.lists[i]._id == event.target.value) {
        actions.addUserListApp(this.state.userLists.lists[i], this.state.app.name);

        break;
      }
    }
  },

  changeTab: function(tab) {
    if (tab != this.state.tab) {
      this.setState({tab: tab});
    }
  },

  swipe: function(direction) {
    var app = null;
    if (direction == 'previous') {
      app = this.state.previousApp;
    }
    else {
      app = this.state.nextApp;
    }

    this.setState({swipe: direction});

    var self = this;
    setTimeout(function() {
      self.history.pushState(null, '/app/' + app.name);
      self.setState({swipe: null});
    }, 350);
  },

  cancelSwipe: function(event) {
    event.preventDefault();
    event.stopPropagation();
  },

  render: function() {
    var cls = 'app';
    if (this.state.swipe == 'previous') {
      cls = 'app slideOutRight';
    }
    else if (this.state.swipe == 'next') {
      cls = 'app slideOutLeft';
    }

    return (
      <Swipeable onSwipedRight={this.swipe.bind(this, 'previous')} onSwipedLeft={this.swipe.bind(this, 'next')}>
        <div className={cls}>
          <If value={this.state.loading}>
            <div className="row">
              <div className="col-md-12 text-center">
                <i className="fa fa-spinner fa-spin fa-4x"></i>
              </div>
            </div>
          </If>

          {(function() {
            var component = '';
            if (!this.state.loading && this.state.app && this.state.app.name == this.props.params.name) {
              var download_style = utils.strToColor(this.state.app.author, 'backgroundColor');
              var share_cls = utils.strToColor(this.state.app.name, 'backgroundColor');
              var url = window.location.protocol + '://' + window.location.host + '/app/' + this.state.app.name;
              var caxton_url = 'scope://com.canonical.scopes.clickstore?q=' + this.state.app.title;
              var author_query = {q: 'author:' + this.state.app.author};

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

              component = (
                <div className="swipe-container">
                  {(function() {
                    var prev = '';
                    if (this.state.previousApp && this.state.previousApp.title) {
                      prev = (
                        <div className="previous-app">
                          <a onClick={this.swipe.bind(this, 'previous')} title={i18n.t('Previous App:') + ' ' + this.state.previousApp.title} className="text-material-grey clickable">
                            <i className="fa fa-2x fa-chevron-left"></i>
                          </a>
                        </div>
                      );
                    }

                    return prev;
                  }).bind(this)()}

                  {(function() {
                    var next = '';
                    if (this.state.nextApp && this.state.nextApp.title) {
                      next = (
                        <div className="next-app">
                          <a onClick={this.swipe.bind(this, 'next')} title={i18n.t('Next App:') + ' ' + this.state.nextApp.title} className="text-material-grey clickable">
                            <i className="fa fa-2x fa-chevron-right"></i>
                          </a>
                        </div>
                      );
                    }

                    return next;
                  }).bind(this)()}

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

                              <If value={this.state.app.author}>
                                <Link to="/apps" query={author_query} title={i18n.t('Author')} className="clickable">{this.state.app.author}</Link>
                              </If>

                              <If value={this.state.app.company}>
                                <span title={i18n.t('Company')}>{this.state.app.company}</span>
                              </If>

                              <Price prices={this.state.app.prices} />

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
                            <If value={this.state.app.types.indexOf('snappy') > -1}>
                              <div className="list-group-item-text">
                                <a href={this.state.app.download} className="btn btn-sm btn-success">{i18n.t('Download')}</a>
                              </div>
                            </If>

                            <If value={this.state.app.types.indexOf('snappy') == -1}>
                              <div className="list-group-item-text">
                                <a href={'scope://com.canonical.scopes.clickstore?q=' + this.state.app.title} className={this.state.app.webapp_inject ? 'btn btn-sm btn-material-red' : 'btn btn-sm btn-material-green'}>{i18n.t('Install')}</a>

                                <div className="small-note">
                                  {i18n.t('*Install will take you to the official appstore on an Ubuntu Touch device')}
                                </div>

                                <If value={this.state.app.webapp_inject}>
                                  <div className="small-note text-material-red">
                                    {i18n.t('*This webapp injects custom code into the website which can add extra features or be malicious. Only use this app if you trust the author.')}
                                  </div>
                                </If>
                              </div>
                            </If>
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
                            <Share url={url} title={this.state.app.title} caxtonUrl={caxton_url} />
                          </div>

                        </div>
                        <div className="list-group-separator"></div>

                        {(function() {
                          var component = '';
                          if (this.state.auth.loggedin && this.state.userLists.loaded) {
                            var existing_ids = [];
                            var existing = [];
                            for (var i = 0; i < this.state.userLists.lists.length; i++) {
                              if (this.state.userLists.lists[i].packages.indexOf(this.state.app.name) > -1) {
                                existing_ids.push(this.state.userLists.lists[i]._id);
                                existing.push(this.state.userLists.lists[i]);
                              }
                            }

                            var lists = '';
                            if (this.state.userLists.lists.length === 0) {
                              lists = (
                                <div>
                                  <Link to="/me">{i18n.t('No lists, create one!')}</Link>
                                </div>
                              );
                            }
                            else {
                              lists = (
                                <div>
                                  {i18n.t('Add to list:')}
                                  <select className="form-control" onChange={this.changeList}>
                                    <option value="">{i18n.t('- Choose a list -')}</option>
                                    {this.state.userLists.lists.map(function(list) {
                                      if (existing_ids.indexOf(list._id) == -1) {
                                        return (
                                          <option value={list._id} key={list._id}>{list.name}</option>
                                        );
                                      }
                                    }, this)}
                                  </select>
                                </div>
                              );
                            }

                            var already_on = '';
                            if (existing.length > 0) {
                              already_on = (
                                <div>
                                  {i18n.t('This app is on these lists:')}
                                  {existing.map(function(list) {
                                    var url = '/list/' + list._id;
                                    return <Link className="label label-success list-label" to={url} key={list._id}>{list.name}</Link>;
                                  }, this)}
                                </div>
                              );
                            }

                            component = (
                              <div ng-show="loggedin">
                                <div className="list-group-item">
                                  <div className="row-action-primary">
                                      <div className="action-icon ubuntu-shape">
                                        <i className="fa fa-list-ul" style={utils.strToColor(this.state.app.title, 'backgroundColor')}></i>
                                      </div>
                                  </div>

                                  <div className="row-content">
                                    <div className="list-group-item-text">
                                      {lists}

                                      <br/>
                                      {already_on}
                                    </div>
                                  </div>

                                </div>
                                <div className="list-group-separator"></div>
                              </div>
                            );
                          }

                          return component;
                        }).bind(this)()}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <ul className="nav nav-pills">
                        <li className={tabs.description}>
                          <a onClick={this.changeTab.bind(this, 'description')} className={inner_tabs.description}>{i18n.t('Description')}</a>
                        </li>
                        <li className={tabs.changelog}>
                          <a onClick={this.changeTab.bind(this, 'changelog')} className={inner_tabs.changelog}>{i18n.t('Changelog')}</a>
                        </li>
                        <li className={tabs.info}>
                          <a onClick={this.changeTab.bind(this, 'info')} className={inner_tabs.info}>{i18n.t('Info')}</a>
                        </li>
                        <li className={tabs.support}>
                          <a onClick={this.changeTab.bind(this, 'support')} className={inner_tabs.support}>{i18n.t('Support')}</a>
                        </li>
                      </ul>

                      <div className="tab-content">
                        <div className="well app-tab">
                          {(function() {
                            var tab = '';
                            if (this.state.tab == 'description') {
                              tab = <div className="description" dangerouslySetInnerHTML={utils.nl2br(this.state.app.description)}></div>;
                            }
                            else if (this.state.tab == 'changelog') {
                              var changelog = this.state.app.changelog;
                              if (!changelog) {
                                changelog = i18n.t('No recent changes');
                              }

                              tab = <div dangerouslySetInnerHTML={utils.nl2br(changelog)}></div>;
                            }
                            else if (this.state.tab == 'info') {
                              tab = (
                                <div>
                                  {i18n.t('Version:')} {this.state.app.version}
                                  <br/>
                                  {i18n.t('Updated:')} {moment(this.state.app.last_updated).format('MMM D, YYYY')}
                                  <br/>
                                  {i18n.t('License:')} {this.state.app.license}
                                  <br/>
                                  {i18n.t('File Size:')} {this.state.app.filesize}
                                  <br/>
                                  {i18n.t('Architecture:')} {this.state.app.architecture.join(', ')}
                                </div>
                              );
                            }
                            else if (this.state.tab == 'support') {
                              tab = (
                                <div>
                                  <If value={this.state.app.support && this.state.app.support.indexOf('mailhide') > -1}>
                                    {i18n.t('Support:')} <a href={this.state.app.support} target="_blank" rel="nofollow">{i18n.t('Email Support')}</a>
                                  </If>

                                  <If value={this.state.app.support && this.state.app.support.indexOf('mailhide') == -1}>
                                    {i18n.t('Support:')} <a href={this.state.app.support} target="_blank" rel="nofollow">{this.state.app.support}</a>
                                  </If>

                                  <If value={this.state.app.website}>
                                    <br/>
                                    {i18n.t('Website:')} <a href={this.state.app.website} rel="nofollow">{this.state.app.website}</a>
                                  </If>

                                  <If value={this.state.app.terms}>
                                    <br/>
                                    {i18n.t('Terms:')}
                                    <div>{this.state.app.terms}</div>
                                  </If>
                                </div>
                              );
                            }

                            return tab;
                          }).bind(this)()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <If value={this.state.app.screenshots.length > 0 && this.state.app.screenshots[0] !== ''}>
                    <div className="row">
                      <div className="col-md-12 text-center">
                        <h3>{i18n.t('Screenshots')}</h3>
                      </div>
                    </div>

                    <Swipeable onSwipedRight={this.cancelSwipe} onSwipedLeft={this.cancelSwipe}>
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
                    </Swipeable>
                  </If>

                  <AppRow apps={this.state.app.author_apps}>
                    <Link to="/apps" query={author_query}>{i18n.t('More Apps by:')} {this.state.app.author}</Link>
                  </AppRow>

                  <AppRow apps={this.state.app.related_apps}>
                    {i18n.t('Similar Apps')}
                  </AppRow>

                  <Reviews name={this.state.app.name} bayesian_average={this.state.app.bayesian_average ? this.state.app.bayesian_average : 0} points={this.state.app.points} />
                </div>
              );
            }

            return component;
          }).bind(this)()}
        </div>
      </Swipeable>
    );
  }
});
