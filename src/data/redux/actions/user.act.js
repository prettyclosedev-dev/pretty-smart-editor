import AsyncStorageWrapper from "../../../utils/AsyncStorageWrapper";

export const setAuth = (info) => ({
  type: "USER_SET_AUTH",
  payload: { info },
});

export const setGuest = isGuest => ({
  type: "USER_SET_GUEST",
  payload: { isGuest }
});

export const logout = () => dispatch => {
  AsyncStorageWrapper.removeItem(AsyncStorageWrapper.USER_KEY).then(() => {
    dispatch({ type: "USER_LOGOUT" });
  });
};
