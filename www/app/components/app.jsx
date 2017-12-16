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
var AddToList = require('./appinfo/addToList');
var Features = require('./appinfo/features');
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
    missingApp: ['missingApp'],
    loading: ['loading'],
    userLists: ['userLists'],
    previousApp: ['previousApp'],
    nextApp: ['nextApp'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      swipe: null,
      moreInfo: false,
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

  swipe: function(direction) {
    var app = null;
    if (direction == 'previous') {
      app = this.state.previousApp;
      actions.triggerPreviousApp();
    }
    else {
      app = this.state.nextApp;
      actions.triggerNextApp();
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

  moreInfo: function() {
    this.setState({moreInfo: !this.state.moreInfo});
  },

  render: function() {
    var cls = 'app';
    if (this.state.swipe == 'previous') {
      cls = 'app slideOutRight';
    }
    else if (this.state.swipe == 'next') {
      cls = 'app slideOutLeft';
    }

    var installLink = '';
    if (this.state.app && this.state.app.store == 'openstore') {
      installLink = 'openstore://' + this.state.app.name;
    }

    var desktop_file = '';
    var scope_ini = '';

    if (this.state.app && this.state.app.desktop_file) {
      for (var name in this.state.app.desktop_file) {
        desktop_file += name.replace(/__/g, '.') + '.desktop\n';
        for (var key in this.state.app.desktop_file[name]) {
          desktop_file += key.replace(/__/g, '.') + '=' + this.state.app.desktop_file[name][key] + '\n';
        }

        desktop_file += '\n\n';
      }
    }

    if (this.state.app && this.state.app.scope_ini) {
      for (var sname in this.state.app.scope_ini) {
        scope_ini += sname.replace(/__/g, '.') + '.ini\n';
        for (var skey in this.state.app.scope_ini[sname]) {
          scope_ini += skey.replace(/__/g, '.') + '=' + this.state.app.scope_ini[sname][skey] + '\n';
        }

        scope_ini += '\n\n';
      }
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
            if (!this.state.loading) {
              if (this.state.app && this.state.app.name == this.props.params.name) {
                var download_style = utils.strToColor(this.state.app.author, 'backgroundColor');
                var url = window.location.protocol + '//' + window.location.host + '/app/' + this.state.app.name;
                var caxton_url = installLink ? installLink : url;
                var author_query = {
                  q: 'author:' + this.state.app.author,
                  type: 'all_types',
                  sort: '-points',
                };

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
                                <If value={this.state.app.store == 'openstore'} className="openstore-tag label label-material-light-blue">OpenStore</If>
                              </div>
                            </div>

                            <div className="row-content app-info">
                              <h1 className="list-group-item-heading">{this.state.app.title}</h1>
                              <div className="list-group-item-text">
                                <If value={this.state.app.bayesian_average}>
                                  <Stars stars={this.state.app.bayesian_average} />
                                  <Hearts hearts={this.state.app.points} />
                                </If>

                                <If value={this.state.app.author}>
                                  <Link to="/apps" query={author_query} title={i18n.t('Author')} className="clickable">{this.state.app.author}</Link>
                                </If>

                                <If value={this.state.app.company}>
                                  <span title={i18n.t('Company')}>{this.state.app.company}</span>
                                </If>

                                <Types types={this.state.app.types} />
                                <Price prices={this.state.app.prices} />
                                <br/>
                                <Features features={this.state.app.features} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="list-group">
                          <div className="list-group-item sharing">
                            <div className="row-action-primary">
                                <div className="action-icon ubuntu-shape">
                                  <i className="fa fa-sa" style={download_style}></i>
                                </div>
                            </div>

                            <div className="row-content">
                              <div className="list-group-item-text">
                                <If value={installLink} element="span">
                                  <a href={installLink} className={this.state.app.webapp_inject ? 'btn btn-sm btn-material-red' : 'btn btn-sm btn-material-green'}>{i18n.t('Install')}</a>
                                </If>

                                <Share url={url} title={this.state.app.title} caxtonUrl={caxton_url} dropdown={true} />

                                <If value={installLink}>
                                  <div className="small-note">
                                    {i18n.t('*Install will take you to the OpenStore app on an Ubuntu Touch device')}
                                  </div>
                                </If>

                                <If value={this.state.app.webapp_inject}>
                                  <div className="small-note text-material-red">
                                    {i18n.t('*This webapp injects custom code into the website which can add extra features or be malicious. Only use this app if you trust the author.')}
                                  </div>
                                </If>
                              </div>
                            </div>
                          </div>

                          <div className="list-group-separator"></div>

                          <AddToList />
                        </div>
                      </div>
                    </div>

                    <If value={this.state.app.screenshots.length > 0 && this.state.app.screenshots[0] !== ''}>
                      <div className="screenshots">
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
                      </div>
                    </If>

                    <div className="well app-tab">
                      <div className="row">
                        <div className="col-md-6">
                          <h3>{i18n.t('Description')}</h3>
                          <If value={this.state.app.tagline}>
                            <div className="description">{this.state.app.tagline}</div>
                          </If>
                          <div className="description" dangerouslySetInnerHTML={utils.nl2br(this.state.app.description)}></div>

                          <If value={this.state.app.changelog}>
                            <h4>{i18n.t('Changelog')}</h4>
                            <div dangerouslySetInnerHTML={utils.nl2br(this.state.app.changelog)} className="changelog"></div>
                          </If>
                        </div>

                        <div className="col-md-6">
                          <If value={this.state.app.permissions && this.state.app.permissions.length > 0}>
                            <h3>{i18n.t('Permissions')}</h3>
                            <ul>
                              {this.state.app.permissions.map(function(permission) {
                                var permissionName = permission.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\w\S*/g, function(txt) {
                                  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); //To title Case
                                });

                                return (
                                  <li key={permission}>{permissionName}</li>
                                );
                              })}
                            </ul>
                          </If>

                          <h3>{i18n.t('Info')}</h3>

                          <div>
                            <If value={this.state.app.store == 'openstore'}>
                              <a href={this.state.app.url} target="_blank" rel="nofollow">{i18n.t('Available from the OpenStore!')}</a>
                            </If>
                            <If value={this.state.app.store != 'openstore'}>
                              {i18n.t('Not available in the OpenStore')}
                            </If>

                            <If value={this.state.app.support && this.state.app.support.indexOf('mailhide') > -1}>
                              {i18n.t('Support:')} <a href={this.state.app.support} target="_blank" rel="nofollow">{i18n.t('Email Support')}</a>
                            </If>

                            <If value={this.state.app.support && this.state.app.support.indexOf('mailhide') == -1}>
                              {i18n.t('Support:')} <a href={this.state.app.support} target="_blank" rel="nofollow">{this.state.app.support}</a>
                            </If>

                            <If value={this.state.app.website}>
                              {i18n.t('Website:')} <a href={this.state.app.website} rel="nofollow">{this.state.app.website}</a>
                            </If>

                            <If value={this.state.app.terms}>
                              {i18n.t('Terms:')}
                              <div>{this.state.app.terms}</div>
                            </If>
                          </div>

                          <div>
                            <br/>
                            {i18n.t('Version:')} {this.state.app.version}
                            <br/>
                            {i18n.t('Updated:')} {moment(this.state.app.last_updated).format('MMM D, YYYY')}
                            <br/>
                            {i18n.t('Published:')} {moment(this.state.app.published_date).format('MMM D, YYYY')}
                            <br/>
                            {i18n.t('License:')} {this.state.app.license}
                            <br/>
                            {i18n.t('File Size:')} {this.state.app.filesize}
                            <br/>
                            {i18n.t('Architectures:')} {this.state.app.architecture.join(', ')}

                            <If value={this.state.app.framework.length > 0} element="span">
                              <br/>
                              {i18n.t('Framework:')} {this.state.app.framework.join(', ')}
                            </If>

                            <If value={this.state.app.url_dispatcher.length > 0} element="span">
                              <br/>
                              {i18n.t('Urls that open in this app:')} &nbsp;
                              <If value={this.state.app.url_dispatcher.length == 1} element="span">
                                {this.state.app.url_dispatcher[0]}
                              </If>

                              <If value={this.state.app.url_dispatcher.length > 1} element="span">
                                <ul>
                                  {this.state.app.url_dispatcher.map(function(url, index) {
                                    return (
                                      <li key={index}>{url}</li>
                                    );
                                  })}
                                </ul>
                              </If>
                            </If>

                            <If value={desktop_file || scope_ini}>
                              <a className="clickable btn btn-success btn-sm" onClick={this.moreInfo}>
                                {this.state.moreInfo ? i18n.t('Less Info') : i18n.t('More Info')}
                              </a>
                              <Swipeable onSwipedRight={this.cancelSwipe} onSwipedLeft={this.cancelSwipe}>
                                <If value={this.state.moreInfo}>
                                  <If value={desktop_file}>
                                    {i18n.t('Desktop File:')}
                                    <pre>{desktop_file}</pre>
                                  </If>

                                  <If value={scope_ini}>
                                    {i18n.t('Scope INI File:')}
                                    <pre>{scope_ini}</pre>
                                  </If>
                                </If>
                              </Swipeable>
                            </If>
                          </div>
                        </div>
                      </div>
                    </div>

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
              else if (this.state.missingApp == this.props.params.name) {
                component = (
                  <div className="text-center">
                    <h1>{i18n.t('The app you are trying to find does not exist or has been removed.')}</h1>

                    <div className="row">
                      <div className="col-sm-6 text-center">
                        <h2><i className="fa fa-search"></i> <Link to="/apps">{i18n.t('Search phone apps')}</Link></h2>
                      </div>
                      <div className="col-sm-6 text-center">
                        <h2><i className="fa fa-search"></i> <Link to="/snaps">{i18n.t('Search snaps')}</Link></h2>
                      </div>
                    </div>
                  </div>
                );
              }
            }

            return component;
          }).bind(this)()}
        </div>
      </Swipeable>
    );
  }
});
