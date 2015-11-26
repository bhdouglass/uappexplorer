var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var AppCell = require('./appCell');

module.exports = React.createClass({
  displayName: 'AppRow',
  mixins: [
    PureRenderMixin,
  ],
  props: {
    apps: React.PropTypes.array,
  },

  render: function() {
    var component = '';
    if (this.props.apps && this.props.apps.length > 0) {
      component = (
        <div>
          <div className="row">
            <div className="col-md-12 text-center">
              <h3>{this.props.children}</h3>
            </div>
          </div>

          <div className="row grid-view">
            {this.props.apps.map(function(app, index, arr) {
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

    return <div>{component}</div>;
  }
});
