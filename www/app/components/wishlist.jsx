var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var If = require('./helpers/if');
var WishEdit = require('./modals/wishEdit');
var Pagination = require('./helpers/pagination');

var LIMIT = 10;

module.exports = React.createClass({
  displayName: 'Wishlist',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    auth: ['auth'],
    wishes: ['wishes'],
    lng: ['lng'],
  },

  getInitialState: function() {
    return {
      show: false,
      page: 0,
    };
  },

  getWishes: function(props, state, forceUpdate) {
    var page = 0;
    if (props.location.query && props.location.query.page) {
      page = props.location.query.page;
    }

    if (page != state.page) {
      this.setState({page: page});
      actions.getWishes(LIMIT, page * LIMIT);
    }
    else if (forceUpdate) {
      actions.getWishes(LIMIT, state.page * LIMIT);
    }
  },

  componentWillMount: function() {
    this.getWishes(this.props, this.state, true);
  },

  componentWillUpdate: function(nextProps, nextState) {
    this.getWishes(nextProps, nextState);
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
        <h2 className="text-center">{i18n.t('What apps do you wish to see on Ubuntu Touch?')}</h2>

        <div className="row">
          <div className="col-xs-12">
            <If value={this.state.auth.loggedin}>
            <div className="text-center">
              <a onClick={this.openModal} className="clickable btn btn-success">
                {i18n.t('Make a wish')}
              </a>

              <WishEdit show={this.state.show} onHide={this.closeModal} />
            </div>
            </If>

            <If value={!this.state.auth.loggedin}>
              <div className="text-center">
                <a onClick={actions.openModal.bind(this, 'login')} className="clickable btn btn-success">
                  {i18n.t('Login to make a wish')}
                </a>
              </div>
            </If>
          </div>
        </div>

        <div className="row">
          {this.state.wishes.wishes.map(function(wish) {
            var url = '/wishlist/' + wish.id;

            return (
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
            );
          })}
        </div>

        <Pagination active={this.state.page} total={pages} base={'/wishlist'} />
      </div>
    );
  }
});
