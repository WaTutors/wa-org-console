/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

const SET_ORGANIZATION = 'SET_ORGANIZATION';

const GET_ORG_SUMMARY_BEGIN = 'GET_ORG_SUMMARY_BEGIN';
const GET_ORG_SUMMARY_SUCCESS = 'GET_ORG_SUMMARY_SUCCESS';
const GET_ORG_SUMMARY_FAILURE = 'GET_ORG_SUMMARY_FAILURE';

const UPDATE_ORG_SUMMARY_BEGIN = 'UPDATE_ORG_SUMMARY_BEGIN';
const UPDATE_ORG_SUMMARY_SUCCESS = 'UPDATE_ORG_SUMMARY_SUCCESS';
const UPDATE_ORG_SUMMARY_FAILURE = 'UPDATE_ORG_SUMMARY_FAILURE';

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

    case GET_ORG_SUMMARY_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case GET_ORG_SUMMARY_SUCCESS: // requires data to be refreshed
      return {
        ...state,
        loading: false,
        ...action.payload,
      };
    case GET_ORG_SUMMARY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_ORG_SUMMARY_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case UPDATE_ORG_SUMMARY_SUCCESS: // requires data to be refreshed
      return {
        ...state,
        loading: false,
        ...action.payload,
      };
    case UPDATE_ORG_SUMMARY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}

// THUNKS
export function getOrgSummaryThunk() {
  return async (dispatch, getState) => {
    dispatch(getOrgSummaryBegin());
    console.log('getState', getState());
    const { org } = getState().userReducer;

    try {
      const { org: summary } = await apiFetch({
        method: 'GET',
        endpoint: `admin/org/summary?oid=${org}`,
      });

      // dispatch bullshit
      dispatch(getOrgSummarySuccess(summary));
    } catch (error) {
      console.error('getSessions thunk threw', error);
      dispatch(getOrgSummaryFailure(error.message));
    }
  };
}

export function setOrgSummaryPropertiesThunk(newProperties) {
  return async (dispatch, getState) => {
    dispatch(updateOrgSummaryBegin());
    console.log('getState', getState());
    const { org, properties } = getState().userReducer;

    try {
      const { org: updates } = await apiFetch({
        method: 'PATCH',
        endpoint: 'admin/org/summary',
        body: {
          oid: org,
          properties: newProperties.sort( // case insensivie sort
            (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
          ),
        },
      });

      // dispatch bullshit
      dispatch(updateOrgSummarySuccess(updates));
    } catch (error) {
      console.error('getSessions thunk threw', error);
      dispatch(updateOrgSummaryFailure(error.message));
    }
  };
}

// ACTIONS

export const setOrganization = (orgName) => ({
  type: SET_ORGANIZATION,
  payload: orgName,
});

export const getOrgSummaryBegin = () => ({
  type: GET_ORG_SUMMARY_BEGIN,
});
export const getOrgSummarySuccess = (summary) => ({
  type: GET_ORG_SUMMARY_SUCCESS,
  payload: summary,
});
export const getOrgSummaryFailure = (error) => ({
  type: GET_ORG_SUMMARY_FAILURE,
  payload: { error },
});

export const updateOrgSummaryBegin = () => ({
  type: UPDATE_ORG_SUMMARY_BEGIN,
});
export const updateOrgSummarySuccess = (updates) => ({
  type: UPDATE_ORG_SUMMARY_SUCCESS,
  payload: updates,
});
export const updateOrgSummaryFailure = (error) => ({
  type: UPDATE_ORG_SUMMARY_FAILURE,
  payload: { error },
});
