import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

const SET_ORGANIZATION = 'SET_ORGANIZATION';

// REDUCER

export default function userReducer(
  state = initialState.user, action = {},
) {
  switch (action.type) {
    case SET_ORGANIZATION:
      return {
        ...state,
        org: action.payload,
      };
    default:
      return state;
  }
}

// THUNKS

// ACTIONS

export const setOrganization = (orgName) => ({
  type: SET_ORGANIZATION,
  payload: orgName,
});
