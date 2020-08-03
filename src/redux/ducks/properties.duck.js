/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

import { generateThunkActions } from './_duckGenerators';

// REDUCER

export default function propertiesReducer(
  state = initialState.lists, action = {},
) {
  switch (action.type) {
    case ADD_PROPERTIES_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case ADD_PROPERTIES_SUCCESS:
      return {
        ...state,
        loading: false,
        properties: [...state.properties, ...action.payload.newProperties],
      };
    case ADD_PROPERTIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
}

// THUNKS

/**
 * function to generate api call thunks
 *
 * @param {string} p.endpoint       the targeted api endpoint
 * @param {object} p.getActions     redux action functions { begin, success, failure } for GET requests
 * @param {object} p.postActions    redux action functions { begin, success, failure } for POST requests
 * @param {object} p.patchActions   redux action functions { begin, success, failure } for PATCH requests
 * @param {object} p.deleteActions  redux action functions { begin, success, failure } for DELETE requests
 *
 * @returns {Object}    thunks   the constructed thunk functions
 * @returns {function}  thunks.getThunk     thunk for a GET http request
 * @returns {function}  thunks.postThunk    thunk for a POST http request
 * @returns {function}  thunks.patchThunk   thunk for a PATCH http request
 * @returns {function}  thunks.deleteThunk  thunk for a DELETE http request
 */
function buildApiThunks({
  endpoint, getActions, postActions, patchActions, deleteActions,
}) {
  function buildGetDeleteThunk(method) {
    return function getDeleteThunk(queryParamObj) {
      return async (dispatch, getState) => {
        if (method === 'GET')
          dispatch(getActions.begin(queryParamObj));
        if (method === 'DELETE')
          dispatch(deleteActions.begin(queryParamObj));

        const { org } = getState().user;
        const params = new URLSearchParams({ org, ...queryParamObj });
        const queryEndpoint = `${endpoint}?${params.toString()}`;
        await apiFetch({
          method,
          endpoint: queryEndpoint,
        })
          .then((parsedResponse) => {
            if (method === 'GET')
              dispatch(getActions.success(parsedResponse));
            if (method === 'DELETE')
              dispatch(deleteActions.success(parsedResponse));
          })
          .catch((error) => {
            console.error(`api thunk ${endpoint} ${method} caught`, error);
            if (method === 'GET')
              dispatch(getActions.success(error.message));
            if (method === 'DELETE')
              dispatch(deleteActions.success(error.message));
          });
      };
    };
  }

  function buildPostPatchThunk(method) {
    return function postPatchThunk(bodyObj) {
      return async (dispatch, getState) => {
        if (method === 'POST')
          dispatch(postActions.begin(bodyObj));
        if (method === 'PATCH')
          dispatch(patchActions.begin(bodyObj));

        const { org } = getState().user;
        await apiFetch({
          method,
          endpoint,
          body: {
            org,
            ...bodyObj,
          },
        })
          .then((parsedResponse) => {
            if (method === 'POST')
              dispatch(postActions.success(parsedResponse));
            if (method === 'PATCH')
              dispatch(patchActions.success(parsedResponse));
          })
          .catch((error) => {
            console.error(`api thunk ${endpoint} ${method} caught`, error);
            if (method === 'POST')
              dispatch(postActions.failure(error.message));
            if (method === 'PATCH')
              dispatch(patchActions.failure(error.message));
          });
      };
    };
  }

  return {
    getThunk: buildGetDeleteThunk('GET'),
    postThunk: buildPostPatchThunk('POST'),
    patchThunk: buildPostPatchThunk('PATCH'),
    deleteThunk: buildGetDeleteThunk('DELETE'),
  };
}

export const {
  getThunk: getSubjectsThunk,
  postThunk: postSubjectsThunk,
  patchThunk: patchSubjectsThunk,
  deleteThunk: deleteSubjectsThunk,
} = buildApiThunks({
  endpoint: '/subjects',
  getActions: {
    begin: getSubjectsBegin,
    success: getSubjectsSuccess,
    failure: getSubjectsFailure,
  },
  postActions: {
    begin: postSubjectsBegin,
    success: postSubjectsSuccess,
    failure: postSubjectsFailure,
  },
  patchActions: {
    begin: patchSubjectsBegin,
    success: patchSubjectsSuccess,
    failure: patchSubjectsFailure,
  },
  deleteActions: {
    begin: deleteSubjectsBegin,
    success: deleteSubjectsSuccess,
    failure: deleteSubjectsFailure,
  },
});

// ACTIONS

function generateApiThunkActions(prefix) {
  const methods = ['get', 'post', 'patch', 'delete'];
  const acts = ['Begin', 'Success', 'Failure'];

  const obj = {};
  methods.forEach((method) => {
    acts.forEach((act) => {
      obj[`${method}${prefix}${act}`] = (payload) => ({
        type: `${method.toUpperCase()}_${prefix}_${act.toUpperCase()}`,
        payload,
      });
    });
  });

  return obj;
}

const STUDENT_PREFIX = 'Subjects';
export const {
  getSubjectsBegin, getSubjectsSuccess, getSubjectsFailure,
  postSubjectsBegin, postSubjectsSuccess, postSubjectsFailure,
  patchSubjectsBegin, patchSubjectsSuccess, patchSubjectsFailure,
  deleteSubjectsBegin, deleteSubjectsSuccess, deleteSubjectsFailure,
} = generateApiThunkActions(STUDENT_PREFIX);
