/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import firebaseAuthService from 'services/firebaseAuthService';
import { toast } from 'react-toastify';

const GET_GROUPS_BEGIN = 'GET_GROUPS_BEGIN';
const GET_GROUPS_SUCCESS = 'GET_GROUPS_SUCCESS';
const GET_GROUPS_FAILURE = 'GET_GROUPS_FAILURE';

const ADD_GROUPS_BEGIN = 'ADD_GROUPS_BEGIN';
const ADD_GROUPS_SUCCESS = 'ADD_GROUPS_SUCCESS';
const ADD_GROUPS_FAILURE = 'ADD_GROUPS_FAILURE';

const REMOVE_GROUP_BEGIN = 'REMOVE_GROUP_BEGIN';
const REMOVE_GROUP_SUCCESS = 'REMOVE_GROUP_SUCCESS';
const REMOVE_GROUP_FAILURE = 'REMOVE_GROUP_FAILURE';

const EDIT_MEMBERS_GROUP_BEGIN = 'EDIT_MEMBERS_GROUP_BEGIN';
const EDIT_MEMBERS_GROUP_SUCCESS = 'EDIT_MEMBERS_GROUP_SUCCESS';
const EDIT_MEMBERS_GROUP_FAILURE = 'EDIT_MEMBERS_GROUP_FAILURE';

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
        list: state.list.filter((el) => el.gid !== action.payload.gid),
      };
    case REMOVE_GROUP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case EDIT_MEMBERS_GROUP_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case EDIT_MEMBERS_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list,
      };
    case EDIT_MEMBERS_GROUP_FAILURE:
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
        endpoint: `admin/groups/${org}`,
      });
      // get phone numbers
      const { groups } = groupsObj;

      // dispatch bullshit
      dispatch(getGroupsSuccess(groups));
    } catch (error) {
      console.error('getGroups thunk threw', error);
      dispatch(getGroupsFailure(error.message));
    }
  };
}

export function createGroupsThunk(inputData) {
  return async (dispatch, getState) => {
    let newGroups;
    if (Array.isArray(inputData))
      newGroups = inputData;
    else
      newGroups = [inputData];

    dispatch(addGroupsBegin());
    try {
      const { org } = getState().userReducer;
      const { uid } = firebaseAuthService.getUser(true);
      console.log({ newGroups });
      // format body
      const body = newGroups.map((data) => ({
        org,
        sender: uid,
        type: 'private',
        name: data.name,
        info: data.info,
        properties: [data.subject],
      // invitees: data.invitees.split('.'), deprecated bc of manager
      }));

      // shouldn't need front end validation, it's a select and a freeform text field

      await apiFetch({
        method: 'POST',
        endpoint: 'group/multi',
        body: { groups: body },
      })
        .then(() => {
          dispatch(addGroupsSuccess(newGroups));
          dispatch(getGroupsThunk());
        })
        .catch((error) => {
          console.error('addGroups');
          dispatch(addGroupsFailure(error.message));
        });
    } catch (error) {
      dispatch(addGroupsFailure(error.message));
      console.log('Error in group creation thunk', error);
    }
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
        endpoint: `group/single/${gid}`,
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

export function editTeacherGroupThunk({ id, addMembers, removeMembers }) {
  return async (dispatch, getState) => {
    dispatch(editMembersGroupBegin());
    console.log('getState', getState());
    const { uid } = firebaseAuthService.getUser(true);

    const body = {
      type: 'group',
      sender: uid,
      itemId: id,
      addMembers,
      removeMembers,
    };

    const request = apiFetch({
      body,
      method: 'PATCH',
      endpoint: 'group/members',
    });

    try {
      const response = await Promise.all([request]);
      dispatch(editMembersGroupSuccess(response));
      dispatch(getGroupsThunk());
    } catch (error) {
      console.error(`editMembersGroupThunk of ${id}, threw`, error);
      dispatch(editMembersGroupFailure(error.message));
    }
  };
}

export function editMembersGroupThunk({ id, addMembers, removeMembers }) {
  return async (dispatch, getState) => {
    dispatch(editMembersGroupBegin());
    console.log('getState', getState());
    const { uid } = firebaseAuthService.getUser(true);

    const body = {
      type: 'groupAndLinkedFutureSessions',
      sender: uid,
      itemId: id,
      addMembers,
      removeMembers,
    };

    const request = apiFetch({
      body,
      method: 'PATCH',
      endpoint: 'group/members',
    });

    try {
      const response = await Promise.all([request]);
      dispatch(editMembersGroupSuccess(response));
      dispatch(getGroupsThunk());
    } catch (error) {
      console.error(`editMembersGroupThunk of ${id}, threw`, error);
      dispatch(editMembersGroupFailure(error.message));
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

export const editMembersGroupBegin = () => ({
  type: EDIT_MEMBERS_GROUP_BEGIN,
});
export const editMembersGroupSuccess = (newGroups) => ({
  type: EDIT_MEMBERS_GROUP_SUCCESS,
  payload: newGroups,
});
export const editMembersGroupFailure = (error) => ({
  type: EDIT_MEMBERS_GROUP_FAILURE,
  payload: { error },
});
