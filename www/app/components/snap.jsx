var React = require('react');
var Router = require('react-router');
var moment = require('moment');
var yaml = require('js-yaml');
var mixins = require('baobab-react/mixins');
var Link = require('react-router').Link;
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var utils = require('../utils');
var Types = require('./appinfo/types');
var Price = require('./appinfo/price');
var AppRow = require('./appinfo/appRow');
var AddToList = require('./appinfo/addToList');
var Share = require('./helpers/share');
var If = require('./helpers/if');

module.exports = React.createClass({
  displayName: 'Snap',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    snap: ['snap'],
    missingSnap: ['missingSnap'],
    loading: ['loading'],
    userLists: ['userLists'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      moreInfo: false,
    };
  },

  componentWillMount: function() {
    actions.getSnap(this.props.params.store, this.props.params.name);
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (nextState.snap && nextState.snap.name) {
      actions.setOG({
        title: nextState.snap.name,
        description: '',
        image: nextState.snap.icon,
      });
    }

    if (this.props.params.name != nextProps.params.name) {
      actions.getSnap(nextProps.params.store, nextProps.params.name);
    }
  },

  moreInfo: function() {
    this.setState({moreInfo: !this.state.moreInfo});
  },

  render: function() {
    console.log('render');
    return (
      <div className="app">
        <If value={this.state.loading}>
          <div className="row">
            <div className="col-md-12 text-center">
              <i className="fa fa-spinner fa-spin fa-4x"></i>
            </div>
          </div>
        </If>

        {(function() {
          console.log('here');
          var component = '';
          if (!this.state.loading) {
            if (this.state.snap && this.state.snap.name == this.props.params.name) {
              var download_style = utils.strToColor(this.state.snap.author, 'backgroundColor');
              var url = window.location.protocol + '//' + window.location.host + '/snap/' + this.state.snap.store + '/' + this.state.snap.name;
              var caxton_url = 'scope://com.canonical.scopes.clickstore?q=' + this.state.snap.title;
              var author_query = {
                q: 'author:' + this.state.snap.author,
                sort: '-points',
              };
              var types = [this.state.snap.type];
              var description = utils.nl2br(this.state.snap.description);
              if (!this.state.snap.description) {
                description = {__html: i18n.t('None Yet')};
              }

              component = (
                <div className="swipe-container">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="list-group">
                        <div className="list-group-item">
                          <div className="row-action-primary">
                            <div className="icon-large ubuntu-shape">
                              <img src={this.state.snap.icon} alt={this.state.snap.name} />
                            </div>
                          </div>

                          <div className="row-content app-info">
                            <h1 className="list-group-item-heading">{this.state.snap.title}</h1>
                            <div className="list-group-item-text">
                              <If value={this.state.snap.author}>
                                <Link to="/snaps" query={author_query} title={i18n.t('Author')} className="clickable">{this.state.snap.author}</Link>
                              </If>

                              <If value={this.state.snap.company}>
                                <span title={i18n.t('Company')}>{this.state.snap.company}</span>
                              </If>

                              <Types types={types} isSnap={true} />
                              <Price prices={this.state.snap.prices} />
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
                              <a href={'snap://' + this.state.snap.name} className='btn btn-sm btn-material-green'>{i18n.t('Install')}</a>

                              <If value={Object.keys(this.state.snap.downloads).length > 0} element="span">
                                <div className="download-dropdown">
                                  <div className="dropdown">
                                    <button className="btn btn-sm btn-success dropdown-toggle" type="button" data-toggle="dropdown">
                                     {i18n.t('Download')} &nbsp;
                                     <span className="caret"></span>
                                    </button>
                                    <ul className="dropdown-menu">
                                      {Object.keys(this.state.snap.downloads).sort().map(function(arch, index) {
                                        return (
                                          <li key={index}>
                                            <a href={this.state.snap.downloads[arch]}>{arch}</a>
                                          </li>
                                        );
                                      }, this)}
                                    </ul>
                                  </div>
                                </div>
                              </If>

                              <Share url={url} title={this.state.snap.title} caxtonUrl={caxton_url} dropdown={true} />
                            </div>

                            <div className="small-note">
                              {i18n.t('Install will take you to the GNOME Software Center (if installed)')}
                              <br/>
                              {i18n.t('Downloading the snap will not give you automatic updates')}
                            </div>
                          </div>
                        </div>

                        <div className="list-group-separator"></div>

                        {/*<AddToList />*/}
                      </div>
                    </div>
                  </div>

                  <If value={this.state.snap.screenshots.length > 0 && this.state.snap.screenshots[0] !== ''}>
                    <div className="screenshots">
                      <div className="row">
                        <div className="col-md-12 text-center">
                          <h3>{i18n.t('Screenshots')}</h3>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12 screenshot-scroll">
                          {this.state.snap.screenshots.map(function(screenshot) {
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
                  </If>

                  <div className="well app-tab">
                    <div className="row">
                      <div className="col-md-6">
                        <h3>{i18n.t('Description')}</h3>
                        <div className="description" dangerouslySetInnerHTML={description}></div>

                        <If value={this.state.snap.changelog}>
                          <h4>{i18n.t('Changelog')}</h4>
                          <div dangerouslySetInnerHTML={utils.nl2br(this.state.snap.changelog)} className="changelog"></div>
                        </If>
                      </div>

                      <div className="col-md-6">
                        <If value={this.state.snap.permissions && this.state.snap.permissions.length > 0}>
                          <h3>{i18n.t('Permissions')}</h3>
                          <ul>
                            {this.state.snap.permissions.map(function(permission) {
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
                          <If value={this.state.snap.support && this.state.snap.support.indexOf('mailhide') > -1}>
                            {i18n.t('Support:')} <a href={this.state.snap.support} target="_blank" rel="nofollow">{i18n.t('Email Support')}</a>
                          </If>

                          <If value={this.state.snap.support && this.state.snap.support.indexOf('mailhide') == -1}>
                            {i18n.t('Support:')} <a href={this.state.snap.support} target="_blank" rel="nofollow">{this.state.snap.support}</a>
                          </If>

                          <If value={this.state.snap.website}>
                            {i18n.t('Website:')} <a href={this.state.snap.website} rel="nofollow">{this.state.snap.website}</a>
                          </If>

                          <If value={this.state.snap.terms}>
                            {i18n.t('Terms:')}
                            <div>{this.state.snap.terms}</div>
                            <br/>
                          </If>
                        </div>

                        <div>
                          {i18n.t('Confinement:')} {this.state.snap.confinement}
                          <br/>
                          {i18n.t('Version:')} {this.state.snap.version}
                          <If value={this.state.snap.last_updated > this.state.snap.published_date} element="span">
                            <br/>
                            {i18n.t('Updated:')} {moment(this.state.snap.last_updated).format('MMM D, YYYY')}
                          </If>
                          <br/>
                          {i18n.t('Published:')} {moment(this.state.snap.published_date).format('MMM D, YYYY')}
                          <If value={this.state.snap.license} element="span">
                            <br/>
                            {i18n.t('License:')} {this.state.snap.license}
                          </If>
                          <br/>
                          {i18n.t('File Size:')} {this.state.snap.filesize}
                          <br/>
                          {i18n.t('Architectures:')} {this.state.snap.architecture.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <AppRow apps={this.state.snap.author_snaps}>
                    <Link to="/snaps" query={author_query}>{i18n.t('More Snaps by:')} {this.state.snap.author}</Link>
                  </AppRow>

                  <AppRow apps={this.state.snap.related_snaps}>
                    {i18n.t('Similar Snaps')}
                  </AppRow>
                </div>
              );
            }
            else if (this.state.missingSnap == this.props.params.name) {
              component = (
                <div className="text-center">
                  <h1>{i18n.t('The snap you are trying to find does not exist or has been removed.')}</h1>

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
    );
  }
});
