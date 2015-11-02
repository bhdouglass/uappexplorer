var Root = require('./components/root');
var Index = require('./components/index');
window.React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');

ReactDOM.render((
  <ReactRouter.Router>
    <ReactRouter.Route path="/" component={Root}>
      <ReactRouter.IndexRoute component={Index} />
    </ReactRouter.Route>
  </ReactRouter.Router>
), document.getElementById('main'));
