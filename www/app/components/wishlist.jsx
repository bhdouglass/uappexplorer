var React = require('react');
var Router = require('react-router');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');
var debounce = require('debounce');

var actions = require('../actions');
var If = require('./helpers/if');
var WishEdit = require('./modals/wishEdit');
var Pagination = require('./helpers/pagination');

var LIMIT = 10;

module.exports = React.createClass({
  displayName: 'Wishlist',
  mixins: [
    mixins.branch,
    Router.History,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    wishes: ['wishes'],
    lng: ['lng'],
  },

  componentWillMount: function() {
    this.debounceSearch = debounce(this.search, 300);

    this.getWishes(this.props, this.state, true);

    actions.setOG({
      title: 'App Wishlist',
      description: 'App wishlist for Ubuntu Touch',
    });
  },

  componentWillUpdate: function(nextProps, nextState) {
    this.getWishes(nextProps, nextState);
  },

  getInitialState: function() {
    return {
      show: false,
      page: 0,
      search: '',
      unsearch: '',
    };
  },

  searchWrap: function(event) {
    this.setState({unsearch: event.target.value});
    this.debounceSearch(event);
  },

  search: function(event) {
    if (event.target.value) {
      this.props.location.query.q = event.target.value;
    }
    else {
      delete this.props.location.query.q;
    }

    this.history.pushState(null, '/wishlist', this.props.location.query);
  },

  getWishes: function(props, state, forceUpdate) {
    var page = 0;
    if (props.location.query && props.location.query.page) {
      page = props.location.query.page;
    }

    var search = '';
    if (props.location && props.location.query) {
      search = props.location.query.q;
    }

    if (page != state.page || search != state.search) {
      this.setState({page: page, search: search, unsearch: search});
      actions.getWishes(LIMIT, page * LIMIT, search);
    }
    else if (forceUpdate) {
      actions.getWishes(LIMIT, state.page * LIMIT, search);
    }
  },

  openModal: function() {
    this.setState({show: true});
  },

  closeModal: function(refresh) {
    this.setState({show: false});

    if (refresh) {
      actions.getWishes(LIMIT, this.state.page * LIMIT);
    }
  },

  render: function() {
    var pages = Math.ceil(this.state.wishes.count / LIMIT);

    return (
      <div className="wishlist">
        <h1 className="text-center">{i18n.t('App Wishlist')}</h1>
        <h3 className="text-center">{i18n.t('What apps do you wish to see on Ubuntu Touch?')}</h3>

        <div className="row">
          <div className="col-sm-5">
            <div className="input-group search-box text-center">
              <span className="input-group-addon">{i18n.t('Search for a wish:')}</span>
              <input type="text" className="form-control" id="search" onChange={this.searchWrap} value={this.state.unsearch} ref="search" />
              <span className="input-group-addon"><i className="fa fa-search"></i></span>
            </div>
          </div>

          <div className="col-sm-7">
            <If value={this.state.auth.loggedin}>
            <div className="pull-right">
              <a onClick={this.openModal} className="clickable btn btn-success">
                {i18n.t('Make a wish')}
              </a>

              <WishEdit show={this.state.show} onHide={this.closeModal} />
            </div>
            </If>

            <If value={!this.state.auth.loggedin}>
              <div className="pull-right">
                <a onClick={actions.openModal.bind(this, 'login')} className="clickable btn btn-success">
                  {i18n.t('Login to make a wish')}
                </a>
              </div>
            </If>
          </div>
        </div>

        <div className="row">
          {this.state.wishes.wishes.map(function(wish, index) {
            var url = '/wishlist/' + wish.id;
            var w = [(
              <div className="col-sm-6" key={wish.id}>
                <div className="list-group">
                  <Link to={url} className="list-group-item clickable">
                    <div className="row-action-primary">
                      <i className="fa fa-chevron-up"></i>
                      <div className="votes">
                        <span className="text-material-light-green">{wish.upvotes}</span>
                        &nbsp;-&nbsp;
                        <span className="text-material-red">{wish.downvotes}</span>
                      </div>
                      <i className="fa fa-chevron-down"></i>
                    </div>

                    <div className="row-content">
                      <div>{i18n.t("I'm wishing for...")}</div>
                      <h4 className="list-group-item-heading word-break">{wish.name}</h4>
                    </div>
                  </Link>
                </div>
              </div>
            )];

            if (index % 2 == 1) {
              w.push(<div className="clearfix" key={wish.id + 'clearfix'}></div>);
            }

            return w;
          })}
        </div>

        <If value={this.state.wishes.wishes.length === 0}>
          <div className="row">
            <div className="col-xs-12 text-center">
              {i18n.t('No wishes found, try searching again.')}
            </div>
          </div>
        </If>

        <Pagination active={this.state.page} total={pages} base={'/wishlist'} />
      </div>
    );
  }
});
