var React = require('react');
var mixins = require('baobab-react/mixins');
var PureRenderMixin = require('react-addons-pure-render-mixin');

module.exports = React.createClass({
  displayName: 'Errors',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    errors: [],
  },

  render: function() {
    return <div></div>;
    //TODO
    /*
    <div class="container" ng-cloak ng-show="error">
    <div class="row">
    <div class="col-sm-12 centered">
    <div class="alert alert-dismissable clickable text-center" ng-click="dismissError()"
      ng-class="{'alert-warning': !errorClass, 'alert-success': errorClass == 'success', 'alert-info': errorClass == 'info'}">

      <button type="button" class="close" ng-click="dismissError()">
        <i class="fa fa-times"></i>
      </button>
      <h4 ng-bind="error"></h4>
    </div>
    </div>
    </div>
    </div>
    */
  }
});
