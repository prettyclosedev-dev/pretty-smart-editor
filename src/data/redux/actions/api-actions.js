import * as types from '../constants/ActionTypes';

export function apiRequest(method) {
  return {
    type: types.API_REQUEST,
    method
  }
}

export function apiResponse(method, data = {}) {
  return {
    type: types.API_RESPONSE,
    method,
    data,
    receivedAt: Date.now()
  }
}

export function apiError(method, error) {
  return {
    type: types.API_ERROR,
    method,
    error
  }
}
