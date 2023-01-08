import { applyMiddleware, createStore, combineReducers } from 'redux'
// import { configureStore } from '@reduxjs/toolkit'

import { routerReducer } from 'react-router-redux'

import userReducer from './reducers/user';
import appReducer from './reducers/app';

// Logger with default options
import logger from 'redux-logger'
import thunk from 'redux-thunk'

export default function configureStore(initialState) {
  const store = createStore(
    combineReducers({
      user: userReducer,
      app: appReducer,
      routing: routerReducer,
    }),
    initialState,
    applyMiddleware(logger, thunk),
    window.devToolsExtension ? window.devToolsExtension() : undefined
  );

  return store;
}
