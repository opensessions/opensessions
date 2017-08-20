/**
 * app.js
 */
import 'babel-polyfill';

// TODO constrain eslint import/no-unresolved rule to this block
// Load the manifest.json file and the .htaccess file
import 'file?name=[name].[ext]!./manifest.json';  // eslint-disable-line import/no-unresolved
import 'file?name=[name].[ext]!./.htaccess';      // eslint-disable-line import/no-unresolved

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, applyRouterMiddleware, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import useScroll from 'react-router-scroll';
import configureStore from './store';
import trackPage from './utils/analytics';

// Import the CSS reset, which HtmlWebpackPlugin transfers to the build folder
import 'sanitize.css/lib/sanitize.css';

// Import Raven
import Raven from 'raven-js';
Raven
    .config('https://f05814fde37c4071ae5deb9020f59daf@sentry.io/206122')
    .install();

// Global exception logging TODO: Move this into imports
window.logException = function (ex, context) {
  Raven.captureException(ex, {
    extra: context
  });
  /*eslint no-console:0*/
  window.console && console.error && console.error(ex);
};

// Create redux store with history
// this uses the singleton browserHistory provided by react-router
// Optionally, this could be changed to leverage a created history
// e.g. `const browserHistory = useRouterHistory(createBrowserHistory)();`
const initialState = {};
const store = configureStore(initialState, browserHistory);

// Sync history and store, as the react-router-redux reducer
// is under the non-default key ("routing"), selectLocationState
// must be provided for resolving how to retrieve the "route" in the state
import { selectLocationState } from 'containers/App/selectors';
const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState: selectLocationState(),
});
history.listen((location) => {
  trackPage(location.href, location.pathname);
});

// Set up the router, wrapping all Routes in the App component
import App from 'containers/App';
import createRoutes from './routes';
const rootRoute = {
  component: App,
  childRoutes: createRoutes(store),
};

ReactDOM.render(
  <Provider store={store}>
    <Router
      history={history}
      routes={rootRoute}
      render={
        // Scroll to top when going to a new page, imitating default browser
        // behaviour
        applyRouterMiddleware(
          useScroll(
            (prevProps, props) => {
              if (prevProps && props) {
                if (prevProps.location.pathname !== props.location.pathname) {
                  return [0, 0];
                }
              }
              return true;
            }
          )
        )
      }
    />
  </Provider>,
  document.getElementById('app')
);

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
import { install } from 'offline-plugin/runtime';
install();
