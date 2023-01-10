export const setInternetState = newInternetState => (dispatch, getState) => {
  dispatch({
    type: "APP_SET_INTERNET_STATE",
    payload: { newInternetState }
  });
};
