/* service */
import { LOGGING_ON } from "../config";

/* redux */
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

import reducers from "./reducers";

const logger = createLogger({
  collapsed: true,
});

// possibility to debug redux actions with https://github.com/jhen0409/react-native-debugger
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const MIDDLEWARES = [thunk, LOGGING_ON && logger].filter(Boolean);

const store = createStore(
  reducers,
  composeEnhancers(applyMiddleware(...MIDDLEWARES))
);

window.reduxStore = store

export default store;
