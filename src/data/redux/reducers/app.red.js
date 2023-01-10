export default function app(state = {}, action) {
  state = {
    isInternetReachable: true, // true is to avoid no internet screen blinking on home screen on load
    ...state
  };

  switch (action.type) {
    case "APP_SET_INTERNET_STATE":
      const isInternetReachable = !!action.payload?.newInternetState;
      return {
        ...state,
        isInternetReachable
      };
  }
  return state;
}
