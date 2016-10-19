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

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    route: routeReducer,
    session: sessionViewReducer,
    sessionList: sessionListViewReducer,
    ...asyncReducers,
  });
}
