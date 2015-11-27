var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var AppCell = require('./appCell');

module.exports = React.createClass({
  displayName: 'AppList',
  mixins: [
    PureRenderMixin
  ],
  props: {
    apps: React.PropTypes.array.isRequired,
    popularity: React.PropTypes.bool,
    view: React.PropTypes.string.isRequired,
    editable: React.PropTypes.bool,
    onRemoveClick: React.PropTypes.function,
  },

  renderAppCell: function(app, index) {
    var cell = [];
    if (this.props.view == 'list') {
      cell.push(
        <div className="list-view col-sm-12" key={app.name}>
          <AppCell app={app} description={true} popularity={this.props.popularity} editable={this.props.editable} onRemoveClick={this.props.onRemoveClick} />
        </div>
      );

      if (index % 3 == 2) {
        cell.push(<div className="hidden-xs hidden-sm clearfix" key={app.name + 'cf1'}></div>);
      }

      if (index % 2 == 1) {
        cell.push(<div className="visible-xs visible-sm clearfix" key={app.name + 'cf2'}></div>);
      }

      cell.push(
        <span className="list" key={app.name + 'sep'}>
          <div className="separator"></div>
        </span>
      );
    }
    else {
      cell.push(
        <div className="col-md-4 col-sm-6 col-xs-6 grid-view" key={app.name}>
          <AppCell app={app} description={false} popularity={this.props.popularity} editable={this.props.editable} onRemoveClick={this.props.onRemoveClick} />
        </div>
      );

      if (index % 3 == 2) {
        cell.push(<div className="hidden-xs hidden-sm clearfix" key={app.name + 'cf1'}></div>);

        cell.push(
          <span className="grid" key={app.name + 'sep1'}>
            <div className="separator hidden-xs hidden-sm"></div>
          </span>
        );
      }

      if (index % 2 == 1) {
        cell.push(<div className="visible-xs visible-sm clearfix" key={app.name + 'cf2'}></div>);

        cell.push(
          <span className="grid" key={app.name + 'sep2'}>
            <div className="separator visible-sm visible-xs"></div>
          </span>
        );
      }
    }

    return cell;
  },

  render: function() {
    return (
      <div className={(this.props.view == 'list') ? 'row app-list list-view' : 'row app-list grid-view'}>
        {this.props.apps.map(function(app, index) {
          return this.renderAppCell(app, index);
        }, this)}
      </div>
    );
  }
});
