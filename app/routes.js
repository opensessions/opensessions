// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
// import { getHooks } from 'utils/hooks';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default function createRoutes() {
  // Create reusable async injectors using getHooks factory
  // const { injectReducer, injectSagas } = getHooks(store);

  return [
    {
      path: '/',
      name: 'home',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/HomePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/register',
      name: 'register',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/RegisterPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/forgot',
      name: 'forgot',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/ForgotPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/profile',
      name: 'My profile',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/MyProfile'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/organizer/:id',
      name: 'Organizer view',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/OrganizerView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/login',
      name: 'login',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/LoginPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/session/add',
      name: 'add session',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/SessionForm'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/session/:sessionID',
      name: 'View session',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/SessionView'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '/session/:uuid/edit',
      name: 'Edit session',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/SessionEdit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        }).catch(errorLoading);
      },
    }, {
      path: '*',
      name: 'notfound',
      getComponent(nextState, cb) {
        System.import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    },
  ];
}
