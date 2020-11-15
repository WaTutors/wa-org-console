/* eslint-disable no-param-reassign */ // allow for redux reset
import {
  applyMiddleware, compose, createStore,
} from 'redux';
import thunkMiddleware from 'redux-thunk';

import * as Sentry from '@sentry/react';

import monitorReducersEnhancer from './enhancers/monitorReducers';
import loggerMiddleware from './middleware/logger';

import appReducer from './ducks';

const rootReducer = (state, action) => {
  // global actions
  if (action.type === 'RESET_APP')
    state = undefined;
  return appReducer(state, action);
};

function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunkMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const sentryReduxEnhancer = Sentry.createReduxEnhancer();

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = compose(...enhancers, sentryReduxEnhancer);

  return createStore(rootReducer, preloadedState, composedEnhancers);
}

const store = configureStore();

export default store;
