var React = require('react');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../../actions');
var If = require('../helpers/if');
var Alerts = require('../helpers/alerts');

module.exports = React.createClass({
  displayName: 'WishEdit',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      wish: {
        existing: false,
      },
    };
  },

  onFieldChange: function(field, event) {
    var wish = JSON.parse(JSON.stringify(this.state.wish));
    if (field == 'existing') {
      wish[field] = event.target.checked;
    }
    else {
      wish[field] = event.target.value;
    }

    this.setState({wish: wish});
  },

  save: function() {
    if (!this.state.wish.name) {
      actions.createAlert(i18n.t('Please specify a name or idea for your wish'), 'error');
    }
    else {
      var self = this;
      actions.createWish(this.state.wish).then(function(wish) {
        if (wish) {
          self.setState({wish: {
            existing: false,
          }});

          self.props.onHide(true);
        }
      });
    }
  },

  close: function() {
    this.props.onHide(false);
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('Missing an app?')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alerts />

          <form className="form-horizontal">
            <div className="form-group">
              <label htmlFor="existing" className="col-md-4 control-label">
                {i18n.t('Is this an existing app?')}
              </label>

              <div className="col-md-8">
                <input type="checkbox" onChange={this.onFieldChange.bind(this, 'existing')} name="existing" checked={this.state.wish.existing} />
              </div>
            </div>

            <If value={!this.state.wish.existing}>
              <div className="form-group">
                <label htmlFor="idea" className="col-md-4 control-label">
                  {i18n.t('Idea Summary')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'name')} name="idea" className="form-control" />
                </div>
              </div>
            </If>

            <If value={this.state.wish.existing}>
              <div className="form-group">
                <label htmlFor="name" className="col-md-4 control-label">
                  {i18n.t('App Name')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'name')} name="name" className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="developer" className="col-md-4 control-label">
                  {i18n.t('Developer/Company')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'developer')} name="developer" className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="google_play_link" className="col-md-4 control-label">
                  {i18n.t('Google Play Link')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'google_play_link')} name="google_play_link" className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="itunes_link" className="col-md-4 control-label">
                  {i18n.t('Itunes Link')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'itunes_link')} name="itunes_link" className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amazon_link" className="col-md-4 control-label">
                  {i18n.t('Amazon Link')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'amazon_link')} name="amazon_link" className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="other_link" className="col-md-4 control-label">
                  {i18n.t('Other Link')}
                </label>

                <div className="col-md-8">
                  <input type="text" onChange={this.onFieldChange.bind(this, 'other_link')} name="other_link" className="form-control" />
                </div>
              </div>
            </If>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <span>
            <a className="btn btn-warning" onClick={this.close}>{i18n.t('Close')}</a>
          </span>
          <span>
            <a className="btn btn-material-blue" onClick={this.save}>{i18n.t('Save')}</a>
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
});
