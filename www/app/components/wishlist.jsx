var React = require('react');
var Link = require('react-router').Link;
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../actions');
var If = require('./helpers/if');
var WishEdit = require('./modals/wishEdit');

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
    };
  },

  componentWillMount: function() {
    actions.getWishes();
  },

  openModal: function() {
    this.setState({show: true});
  },

  closeModal: function(refresh) {
    this.setState({show: false});

    if (refresh) {
      actions.getWishes();
    }
  },

  render: function() {
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
          {this.state.wishes.map(function(wish) {
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
      </div>
    );
  }
});
