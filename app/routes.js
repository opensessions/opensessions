// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
// import { getHooks } from 'utils/hooks';

const errorLoading = err => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = cb => componentModule => {
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
        System.import('containers/HomePage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/terms',
      name: 'terms',
      getComponent(nextState, cb) {
        System.import('containers/TermsPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/partner',
      name: 'partner',
      getComponent(nextState, cb) {
        System.import('containers/PartnerPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      }
    }, {
      path: '/sessions',
      name: 'sessions',
      getComponent(nextState, cb) {
        System.import('containers/ListSessions')
          .then(loadModule(cb))
          .catch(errorLoading);
      }
    }, {
      path: '/profile',
      name: 'My profile',
      getComponent(nextState, cb) {
        System.import('containers/MyProfile')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/organizer/:uuid',
      name: 'Organizer view',
      getComponent(nextState, cb) {
        System.import('containers/OrganizerView')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/session/add',
      name: 'add session',
      getComponent(nextState, cb) {
        System.import('containers/SessionForm')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/session/:uuid',
      name: 'View session',
      getComponent(nextState, cb) {
        System.import('containers/SessionView')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/session/:uuid/edit',
      name: 'Edit session',
      getComponent(nextState, cb) {
        System.import('containers/SessionEdit')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/session/:uuid/edit/:tab',
      name: 'Edit session',
      getComponent(nextState, cb) {
        System.import('containers/SessionEdit')
          .then(loadModule(cb))
          .catch(errorLoading);
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
