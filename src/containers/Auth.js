import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'

import Loading from '../components/General/Loading'

const locationHelper = locationHelperBuilder({})

const userIsAuthenticatedDefaults = {
  authenticatedSelector: state => {
    return state.user && state.user.data && !_.isEmpty(state.user.data)
  },
  wrapperDisplayName: 'UserIsAuthenticated'
}

export const userIsAuthenticated = connectedAuthWrapper(userIsAuthenticatedDefaults)

export const userIsAuthenticatedRedir = connectedRouterRedirect({
  ...userIsAuthenticatedDefaults,
  AuthenticatingComponent: Loading,
  authenticatingSelector: state => state.user.isFetching,
  redirectPath: '/login'
})

export const userIsAdminRedir = connectedRouterRedirect({
  redirectPath: '/',
  AuthenticatingComponent: Loading,
  allowRedirectBack: false,
  authenticatedSelector: state => state.user && state.user.data && !_.isEmpty(state.user.data) && 
                                  (state.user.data.is_admin || (state.user.data.account && state.user.data.account.permission_level === 0)),
  //predicate: user => user.isAdmin,
  wrapperDisplayName: 'UserIsAdmin'
})

const userIsNotAuthenticatedDefaults = {
  // Want to redirect the user when they are done loading and authenticated
  authenticatedSelector: state => {
    return !state.user.data || _.isEmpty(state.user.data)
  },
  wrapperDisplayName: 'UserIsNotAuthenticated'
}

export const userIsNotAuthenticated = connectedAuthWrapper(userIsNotAuthenticatedDefaults)

export const userIsNotAuthenticatedRedir = connectedRouterRedirect({
  ...userIsNotAuthenticatedDefaults,
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
  allowRedirectBack: false
})


