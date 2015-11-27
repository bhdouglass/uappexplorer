var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var Swipeable = require('react-swipeable');

var actions = require('../../actions');
var If = require('./if');

module.exports = React.createClass({
  displayName: 'Alerts',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    alert: ['alert'],
  },

  dismiss: function(exe, event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.state.alert.callback && exe) {
      this.state.alert.callback();
    }

    actions.clearAlert();
  },

  render: function() {
    var cls = 'alert alert-dismissable clickable text-center alert-warning';
    if (this.state.alert.type == 'success') {
      cls = 'alert alert-dismissable clickable text-center alert-success';
    }
    else if (this.state.alert.type == 'info') {
      cls = 'alert alert-dismissable clickable text-center alert-info';
    }

    return (
      <If value={this.state.alert && this.state.alert.text}>
        <div className="row">
          <div className="col-sm-12 centered">
            <Swipeable onSwipedRight={this.dismiss.bind(this, false)} onSwipedLeft={this.dismiss.bind(this, false)}>
              <div className={cls} onClick={this.dismiss.bind(this, true)}>
                <a className="close" onClick={this.dismiss.bind(this, false)}>
                  <i className="fa fa-times"></i>
                </a>
                <h4>{this.state.alert.text}</h4>
              </div>
            </Swipeable>
          </div>
        </div>
      </If>
    );
  }
});
