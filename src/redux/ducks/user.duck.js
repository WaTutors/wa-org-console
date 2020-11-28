/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

import firebaseAuthService from 'services/firebaseAuthService';
import { getGroupsThunk, removeGroupSuccess } from './group.duck';

const SET_ORGANIZATION = 'SET_ORGANIZATION';

const GET_ORG_SUMMARY_BEGIN = 'GET_ORG_SUMMARY_BEGIN';
const GET_ORG_SUMMARY_SUCCESS = 'GET_ORG_SUMMARY_SUCCESS';
const GET_ORG_SUMMARY_FAILURE = 'GET_ORG_SUMMARY_FAILURE';

const UPDATE_ORG_SUMMARY_BEGIN = 'UPDATE_ORG_SUMMARY_BEGIN';
const UPDATE_ORG_SUMMARY_SUCCESS = 'UPDATE_ORG_SUMMARY_SUCCESS';
const UPDATE_ORG_SUMMARY_FAILURE = 'UPDATE_ORG_SUMMARY_FAILURE';

const CREATE_ORG_BEGIN = 'CREATE_ORG_BEGIN';
const CREATE_ORG_SUCCESS = 'CREATE_ORG_SUCCESS';
const CREATE_ORG_FAILURE = 'CREATE_ORG_FAILURE';

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
    case GET_ORG_SUMMARY_SUCCESS:
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

    case CREATE_ORG_BEGIN:
      return {
        ...state,
        error: null,
      };

    case CREATE_ORG_SUCCESS:
      return {
        ...state,
        payload: action.payload.payload,
      };

    case CREATE_ORG_FAILURE:
      return {
        ...state,
        error: action.payload.error,
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
    const { org, properties } = getState().userReducer;

    try {
      const { org: updates } = await apiFetch({
        method: 'PATCH',
        endpoint: 'admin/org/summary',
        body: {
          oid: org,
          properties: newProperties.sort( // case insensitive sort
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

export function removeOrgGroupLabelsThunk(toRemove) {
  return async (dispatch, getState) => {
    dispatch(updateOrgSummaryBegin());
    const { org, groupLabels } = getState().userReducer;
    const newGroupLabels = groupLabels.filter((el) => el !== toRemove);

    try {
      // delete group
      const { gid } = await apiFetch({
        method: 'DELETE',
        endpoint: `group/label/${org}/${toRemove}`,
      });
      // update stored data
      const { org: updates } = await apiFetch({
        method: 'PATCH',
        endpoint: 'admin/org/summary',
        body: {
          oid: org,
          groupLabels: newGroupLabels.sort( // case insensitive sort
            (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
          ),
        },
      });
      // dispatch bullshit
      dispatch(updateOrgSummarySuccess(updates));
      dispatch(removeGroupSuccess({ gid }));
    } catch (error) {
      console.error('getSessions thunk threw', error);
      dispatch(updateOrgSummaryFailure(error.message));
      dispatch(getGroupsThunk()); // refresh groups on fail
    }
  };
}

export function addOrgGroupLabelsThunk(toAdd) {
  return async (dispatch, getState) => {
    dispatch(updateOrgSummaryBegin());
    const { org, groupLabels } = getState().userReducer;
    const { uid } = firebaseAuthService.getUser(true);
    const newGroupLabels = [
      ...(groupLabels || []),
      toAdd,
    ];

    try {
      // update groups
      const respGroupAdd = await apiFetch({
        method: 'POST',
        endpoint: 'group/label',
        body: {
          org,
          label: toAdd,
          sender: uid,
        },
      });
      // update stored data
      const { org: updates } = await apiFetch({
        method: 'PATCH',
        endpoint: 'admin/org/summary',
        body: {
          oid: org,
          groupLabels: newGroupLabels.sort( // case insensitive sort
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
    dispatch(getGroupsThunk()); // refresh groups on every case
  };
}

export function createOrgThunk(name) {
  return async (dispatch) => {
    dispatch(createOrgBegin());

    await apiFetch({
      method: 'POST',
      endpoint: 'admin/org/create',
      body: {
        orgName: `simulation-${name}`,
        orgType: 'sim',
        entityName: name,
        contactEmail: 'info@watutor.com',
      },
    })
      .then(() => {
        dispatch(createOrgSuccess());
      })
      .catch((error) => {
        dispatch(createOrgFailure(error));
      });
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

const createOrgBegin = () => ({
  type: CREATE_ORG_BEGIN,
});

const createOrgSuccess = (payload) => ({
  type: CREATE_ORG_SUCCESS,
  payload: { payload },
});

const createOrgFailure = (error) => ({
  type: CREATE_ORG_FAILURE,
  payload: { error },
});
