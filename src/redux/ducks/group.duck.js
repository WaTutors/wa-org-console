/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import firebaseAuthService from 'services/firebaseAuthService';

const GET_GROUPS_BEGIN = 'GET_GROUPS_BEGIN';
const GET_GROUPS_SUCCESS = 'GET_GROUPS_SUCCESS';
const GET_GROUPS_FAILURE = 'GET_GROUPS_FAILURE';

const ADD_GROUPS_BEGIN = 'ADD_GROUPS_BEGIN';
const ADD_GROUPS_SUCCESS = 'ADD_GROUPS_SUCCESS';
const ADD_GROUPS_FAILURE = 'ADD_GROUPS_FAILURE';

const REMOVE_GROUP_BEGIN = 'REMOVE_GROUP_BEGIN';
const REMOVE_GROUP_SUCCESS = 'REMOVE_GROUP_SUCCESS';
const REMOVE_GROUP_FAILURE = 'REMOVE_GROUP_FAILURE';
// REDUCER

export default function groupsReducer(
  state = initialState.groups, action = {},
) {
  switch (action.type) {
    case GET_GROUPS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case GET_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case GET_GROUPS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_GROUPS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case ADD_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [...state.list, ...action.payload],
      };
    case ADD_GROUPS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case REMOVE_GROUP_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case REMOVE_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.filter((el) => {
          if (el.pid)
            return el.pid !== action.payload.pid;
          return el.iid !== action.payload.iid;
        }),
      };
    case REMOVE_GROUP_FAILURE:
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
const getProfileFromPhoneNumber = firebaseAuthService
  .generateCallableFunction('getPhoneNumberFromProfile');

export function getGroupsThunk() {
  return async (dispatch, getState) => {
    dispatch(getGroupsBegin());
    console.log('getState', getState());
    const { org } = getState().userReducer;

    try {
      const groupsObj = await apiFetch({
        method: 'GET',
        endpoint: `admin/profiles/consumer/${org}`,
      });
      // get phone numbers
      const { profiles, invites } = groupsObj;
      const uuids = profiles.map((profile) => profile.uuid);
      const profilePhoneNumbers = await getProfileFromPhoneNumber({ uuids });
      console.log({ profilePhoneNumbers });
      profilePhoneNumbers.data.forEach((phone, i) => { profiles[i].phone = phone; });
      // dispatch bullshit
      dispatch(getGroupsSuccess([...profiles, ...invites]));
    } catch (error) {
      console.error('getGroups thunk threw', error);
      dispatch(getGroupsFailure(error.message));
    }
  };
}

export function createGroupsThunk(inputData) { // TODO
  return async (dispatch, getState) => {
    let newGroups;
    if (Array.isArray(inputData))
      newGroups = inputData;
    else
      newGroups = [inputData];

    dispatch(addGroupsBegin());
    const { org } = getState().userReducer;
    const { uid } = firebaseAuthService.getUser(true);

    // format body
    const body = inputData.map((data) => ({
      sender: uid,
      type: data.type,
      info: data.info,
      labels: [data.subject],
      invitees: data.invitees,
    }));

    await apiFetch({
      method: 'POST',
      endpoint: '/group/multi', // TODO
      body: { groups: body },
    })
      .then(() => {
        dispatch(addGroupsSuccess(newGroups));
      })
      .catch((error) => {
        console.error('addGroups');
        dispatch(addGroupsFailure(error.message));
      });
  };
}

export function removeGroupThunk({ gid, iid }) {
  return async (dispatch, getState) => {
    dispatch(getGroupsBegin());
    console.log('getState', getState());
    const { org, uuid } = getState().userReducer;

    let request;
    if (gid)
      request = apiFetch({
        method: 'DELETE',
        endpoint: `/group/single/${gid}`,
      });
    else if (iid)
      request = apiFetch({
        method: 'DELETE',
        endpoint: `admin/org/invitations?iids=${iid}`,
      });
    else
      throw new Error('removeGroupThunk pid or iid must be defined');

    try {
      await Promise.all([request]);
      dispatch(removeGroupSuccess({ gid, iid }));
    } catch (error) {
      console.error(`removeGroupThunk of ${gid || iid}, threw`, error);
      dispatch(removeGroupFailure(error.message));
    }
  };
}

// ACTIONS
export const getGroupsBegin = () => ({
  type: GET_GROUPS_BEGIN,
});
export const getGroupsSuccess = (newGroups) => ({
  type: GET_GROUPS_SUCCESS,
  payload: newGroups,
});
export const getGroupsFailure = (error) => ({
  type: GET_GROUPS_FAILURE,
  payload: { error },
});

export const addGroupsBegin = () => ({
  type: ADD_GROUPS_BEGIN,
});
export const addGroupsSuccess = (newGroups) => ({
  type: ADD_GROUPS_SUCCESS,
  payload: newGroups,
});
export const addGroupsFailure = (error) => ({
  type: ADD_GROUPS_FAILURE,
  payload: { error },
});

export const removeGroupBegin = () => ({
  type: REMOVE_GROUP_BEGIN,
});
export const removeGroupSuccess = (newGroups) => ({
  type: REMOVE_GROUP_SUCCESS,
  payload: newGroups,
});
export const removeGroupFailure = (error) => ({
  type: REMOVE_GROUP_FAILURE,
  payload: { error },
});
