window.React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var createBrowserHistory = require('history/lib/createBrowserHistory');
window.jQuery = window.$ = require('jquery');
require('bootstrap');
require('swipebox');

var Root = require('./components/root');
var Index = require('./components/index');
var Apps = require('./components/apps');
var App = require('./components/app');
var Snaps = require('./components/snaps');
var Snap = require('./components/snap');
var Me = require('./components/me');
var List = require('./components/list');
var FAQ = require('./components/faq');
var Login = require('./components/login');
var Feeds = require('./components/feeds');
var AppRequest = require('./components/appRequest');
var actions = require('./actions');

var h = createBrowserHistory({
  queryKey: false
});

h.listen(function(location) {
  actions.setLocation(location.pathname + location.search);

  window.jQuery('#main-menu').collapse('hide');

  if (window.jQuery.swipebox.isOpen) {
    window.jQuery.swipebox.close();
  }
});

window.jQuery('.swipebox').swipebox();

ReactDOM.render((
  <ReactRouter.Router history={h}>
    <ReactRouter.Route path="/" component={Root}>
      <ReactRouter.IndexRoute component={Index} />
      <ReactRouter.Route path="/apps" component={Apps} />
      {/* TODO bring back when the api supports it again 
        <ReactRouter.Route path="/apps/request" component={AppRequest} />
      */}
      <ReactRouter.Route path="/app/:name" component={App} />
      <ReactRouter.Route path="/snaps" component={Snaps} />
      <ReactRouter.Route path="/snap/:store/:name" component={Snap} />
      <ReactRouter.Route path="/me" component={Me} />
      <ReactRouter.Route path="/list/:id" component={List} />
      <ReactRouter.Route path="/faq" component={FAQ} />
      <ReactRouter.Route path="/login" component={Login} />
      <ReactRouter.Route path="/feeds" component={Feeds} />
    </ReactRouter.Route>
  </ReactRouter.Router>
), document.getElementById('main'));
