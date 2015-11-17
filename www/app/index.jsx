window.React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var createBrowserHistory = require('history/lib/createBrowserHistory');

var Root = require('./components/root');
var Index = require('./components/index');
var Apps = require('./components/apps');
var App = require('./components/app');
var Me = require('./components/me');
var List = require('./components/list');

var bh = createBrowserHistory({
  queryKey: false
});

ReactDOM.render((
  <ReactRouter.Router history={bh}>
    <ReactRouter.Route path="/" component={Root}>
      <ReactRouter.IndexRoute component={Index} />
      <ReactRouter.Route path="/apps" component={Apps} />
      <ReactRouter.Route path="/app/:name" component={App} />
      <ReactRouter.Route path="/me" component={Me} />
      <ReactRouter.Route path="/list/:id" component={List} />
    </ReactRouter.Route>
  </ReactRouter.Router>
), document.getElementById('main'));
