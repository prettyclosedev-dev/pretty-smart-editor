import * as types from '../../constants/ActionTypes';

export function appInit(payload) {
  return {
    type: types.APP_INIT,
    payload
  }
}

export function appDimensions(width,height) {
  return {
    type: types.APP_DIMENSIONS,
    width: width,
    height: height
  }
}

export function updateUser(method, data = {}) {
  return {
    type: types.UPDATE_USER,
    method,
    data,
    receivedAt: Date.now()
  }
}