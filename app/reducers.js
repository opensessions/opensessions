/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from 'redux-immutable';
import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */

// Initial routing state
const routeInitialState = fromJS({
  locationBeforeTransitions: null,
});

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return state.merge({
        locationBeforeTransitions: action.payload,
      });
    default:
      return state;
  }
}

const cookieNotificationsInitialState = [];

function cookieNotificationsReducer(state = cookieNotificationsInitialState, action) {
  switch (action.type) {
    case 'COOKIE_NOTIFICATION_PUSH':
      return [...state, action.payload];
    case 'COOKIE_NOTIFICATION_DISMISS':
      return [...state.filter(note => note.id !== action.payload)];
    default:
      return state;
  }
}

const notificationsInitialState = [];

function notificationsReducer(state = notificationsInitialState, action) {
  switch (action.type) {
    case 'NOTIFICATION_PUSH':
      return [...state, action.payload];
    case 'NOTIFICATION_DISMISS':
      return [...state.filter(note => note.id !== action.payload)];
    default:
      return state;
  }
}

const sessionInitialState = fromJS(null);

function sessionViewReducer(state = sessionInitialState, action) {
  switch (action.type) {
    case 'SESSION_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const sessionListInitialState = fromJS(null);

function sessionListViewReducer(state = sessionListInitialState, action) {
  switch (action.type) {
    case 'SESSION_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const userListInitialState = fromJS(null);

function userListViewReducer(state = userListInitialState, action) {
  switch (action.type) {
    case 'USER_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const emailListInitialState = fromJS(null);

function emailListViewReducer(state = emailListInitialState, action) {
  switch (action.type) {
    case 'EMAIL_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const selectListInitialState = {};

function selectListReducer(state = selectListInitialState, action) {
  const newObject = {};
  switch (action.type) {
    case 'SELECT_LIST_LOADED':
      newObject[action.key] = action.payload;
      return { ...state, ...newObject };
    default:
      return state;
  }
}

const organizerListInitialState = fromJS(null);

function organizerListViewReducer(state = organizerListInitialState, action) {
  switch (action.type) {
    case 'ORGANIZER_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const activityListInitialState = fromJS(null);

function activityListViewReducer(state = activityListInitialState, action) {
  switch (action.type) {
    case 'ACTIVITY_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const profileOrganizersInitialState = fromJS(null);

function profileOrganizersViewReducer(state = profileOrganizersInitialState, action) {
  switch (action.type) {
    case 'PROFILE_ORGANIZERS_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const profileSessionsInitialState = fromJS(null);

function profileSessionsViewReducer(state = profileSessionsInitialState, action) {
  switch (action.type) {
    case 'PROFILE_SESSIONS_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const formFocusIndexInitialState = 0;

function formFocusIndexReducer(state = formFocusIndexInitialState, action) {
  switch (action.type) {
    case 'FORM_FOCUS':
      return action.payload;
    default:
      return state;
  }
}

const mapClusteredInitialState = false;

function mapClusteredReducer(state = mapClusteredInitialState, action) {
  switch (action.type) {
    case 'MAP_OPTIONS_CLUSTER':
      return action.payload;
    default:
      return state;
  }
}

const analysisListInitialState = false;

function analysisListReducer(state = analysisListInitialState, action) {
  switch (action.type) {
    case 'ANALYSIS_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const partnerListInitialState = [];

function partnerListReducer(state = partnerListInitialState, action) {
  switch (action.type) {
    case 'PARTNER_LIST_LOADED':
      return action.payload;
    default:
      return state;
  }
}

const rdpeInitialState = [];

function rdpeReducer(state = rdpeInitialState, action) {
  switch (action.type) {
    case 'RDPE_LOADED':
      return action.payload;
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    route: routeReducer,
    notifications: notificationsReducer,
    cookieNotifications: cookieNotificationsReducer,
    session: sessionViewReducer,
    sessionList: sessionListViewReducer,
    userList: userListViewReducer,
    emailList: emailListViewReducer,
    selectList: selectListReducer,
    organizerList: organizerListViewReducer,
    activityList: activityListViewReducer,
    profileOrganizersList: profileOrganizersViewReducer,
    profileSessionsList: profileSessionsViewReducer,
    formFocusIndex: formFocusIndexReducer,
    mapClustered: mapClusteredReducer,
    analysisList: analysisListReducer,
    partnerList: partnerListReducer,
    rdpe: rdpeReducer,
    ...asyncReducers,
  });
}
