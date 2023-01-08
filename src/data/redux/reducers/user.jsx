import * as types from '../../constants/ActionTypes';

const defaultState = {
  isFetching: true,
  initialized: false,
  data: {}
}

const userReducer = (state = defaultState, action) => {
  if (["getCurrentUser", "updateUser", "login", "signup", "logout", "selectAccount", "updateAccountName","addNewAccount", "changePlan"].indexOf(action.method) > -1) {
    switch (action.type) {
      case types.API_REQUEST:
        return Object.assign({}, state, {
          isFetching: true
        })
      case types.API_RESPONSE:
        return Object.assign({}, state, {
          isFetching: false,
          data: action.data,
          initialized: true
        })
      case types.API_ERROR:
        return Object.assign({}, state, {
          isFetching: false,
          initialized: true
        })
      case types.UPDATE_USER:
        return Object.assign({}, state, {
          data: action.data
        })
      default:
        return state
    }
  }

  if (action.method === 'logout') {
    return Object.assign({}, defaultState)
  }

  return state
}

export default userReducer
