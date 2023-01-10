export default function user(state = {}, action) {
  state = {
    isGuest: false,
    info: {},
    ...state,
  };

  switch (action.type) {
    case "USER_SET_AUTH":
      const { info } = action.payload;
      return {
        ...state,
        info,
      };
    case "USER_SET_GUEST":
      const { isGuest } = action.payload;
      return {
        ...state,
        isGuest
      };
  }
  return state;
}
