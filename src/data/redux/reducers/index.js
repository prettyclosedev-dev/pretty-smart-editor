import { combineReducers } from "redux";
import app from "./app.red";
import user from "./user.red";

const appReducer = combineReducers({
  app,
  user
});

export default (state, action) => {
  if (action.type === "USER_LOGOUT") {
    state = {
      app: state.app
    };
  }
  return appReducer(state, action);
};
