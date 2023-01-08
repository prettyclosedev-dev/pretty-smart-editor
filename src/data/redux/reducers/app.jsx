import * as types from '../../constants/ActionTypes';

const defaultState = {}

const app = (state = defaultState, action) => {

  if (action.type === types.APP_INIT) {
    return state
  }

  if (action.type === types.APP_DIMENSIONS) {
  	return Object.assign({}, state, { 
      	width: action.width,
      	height: action.height
    })
  }

  return state
  
}

export default app
