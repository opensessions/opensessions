import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from '../../app/containers/App';
import AppServer from '../../app/containers/AppServer';

import createRoutes from '../../app/routes';

const getRenderedPage = req => new Promise((resolve, reject) => {
  const store = createStore(state => state);
  const routes = { root: App, childRoutes: createRoutes(store) };
  match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
    if (error) {
      reject(error);
    } else if (redirectLocation) {
      console.log(redirectLocation);
    } else if (renderProps) {
      console.log('renderProps', renderProps);
      const readyOnAllActions = renderProps.components
        .filter(component => component && component.fetchData)
        .map(component => component.fetchData(store.dispatch, renderProps.params));
      Promise
        .all(readyOnAllActions)
        .then(() => {
          const appHTML = renderToStaticMarkup(<Provider store={store}><RouterContext {...renderProps} /></Provider>);
          resolve(renderToStaticMarkup(<AppServer html={appHTML} />));
        })
        .catch(reject);
    }
  });
});

export default getRenderedPage;
