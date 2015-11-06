var Root = require('./components/root');
var Index = require('./components/index');
var Apps = require('./components/apps');
var App = require('./components/app');
window.React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var createBrowserHistory = require('history/lib/createBrowserHistory');

var bh = createBrowserHistory({
  queryKey: false
});

ReactDOM.render((
  <ReactRouter.Router history={bh}>
    <ReactRouter.Route path="/" component={Root}>
      <ReactRouter.IndexRoute component={Index} />
      <ReactRouter.Route path="/apps" component={Apps} />
      <ReactRouter.Route path="/app/:name" component={App} />
    </ReactRouter.Route>
  </ReactRouter.Router>
), document.getElementById('main'));
