/* eslint-disable no-use-before-define */
import moment from 'moment';

import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import firebaseAuthService from 'services/firebaseAuthService';

const TIME_STRING = 'HH:mm-MM-DD-YY ZZ';

const GET_SESSIONS_BEGIN = 'GET_SESSIONS_BEGIN';
const GET_SESSIONS_SUCCESS = 'GET_SESSIONS_SUCCESS';
const GET_SESSIONS_FAILURE = 'GET_SESSIONS_FAILURE';

const ADD_SESSIONS_BEGIN = 'ADD_SESSIONS_BEGIN';
const ADD_SESSIONS_SUCCESS = 'ADD_SESSIONS_SUCCESS';
const ADD_SESSIONS_FAILURE = 'ADD_SESSIONS_FAILURE';

const REMOVE_SESSION_BEGIN = 'REMOVE_SESSION_BEGIN';
const REMOVE_SESSION_SUCCESS = 'REMOVE_SESSION_SUCCESS';
const REMOVE_SESSION_FAILURE = 'REMOVE_SESSION_FAILURE';

const EDIT_USERS_BEGIN = 'EDIT_USERS_BEGIN';
const EDIT_USERS_SUCCESS = 'EDIT_USERS_SUCCESS';
const EDIT_USERS_FAILURE = 'EDIT_USERS_FAILURE';

const GET_AVAILABLE_BEGIN = 'GET_AVAILABLE_BEGIN';
const GET_AVAILABLE_SUCCESS = 'GET_AVAILABLE_SUCCESS';
const GET_AVAILABLE_FAILURE = 'GET_AVAILABLE_FAILURE';

// REDUCER

export default function sessionsReducer(
  state = initialState.sessions, action = {},
) {
  switch (action.type) {
    case GET_SESSIONS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case GET_SESSIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case GET_SESSIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_SESSIONS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case ADD_SESSIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [...state.list, ...action.payload],
      };
    case ADD_SESSIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case REMOVE_SESSION_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case REMOVE_SESSION_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.filter((el) => el.sid !== action.payload.sid),
      };
    case REMOVE_SESSION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case EDIT_USERS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case EDIT_USERS_SUCCESS: // requires data to be refreshed
      return {
        ...state,
        loading: false,
      };
    case EDIT_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case GET_AVAILABLE_BEGIN:
      return {
        ...state,
        error: null,
      };

    case GET_AVAILABLE_SUCCESS:
      return {
        ...state,
        availableSessions: action.payload,
      };

    case GET_AVAILABLE_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };

    default:
      return state;
  }
}

// THUNKS
const getProfileFromPhoneNumber = firebaseAuthService
  .generateCallableFunction('getPhoneNumberFromProfile');

export function getSessionsThunk() {
  return async (dispatch, getState) => {
    dispatch(getSessionsBegin());
    console.log('getState', getState());
    const { org } = getState().userReducer;

    try {
      const queryString = `?org=${org}&limit=500`;
      const sessionsObj = await apiFetch({
        method: 'GET',
        endpoint: `session/query${queryString}`,
      });
      // get phone numbers
      const sessions = Object.values(sessionsObj);

      // dispatch bullshit
      dispatch(getSessionsSuccess(sessions));
    } catch (error) {
      console.error('getSessions thunk threw', error);
      dispatch(getSessionsFailure(error.message));
    }
  };
}

export function createSessionsThunk(inputData, selectedSession) {
  return async (dispatch, getState) => {
    let newSessions;
    if (Array.isArray(inputData))
      newSessions = inputData;
    else
      newSessions = [inputData];

    dispatch(addSessionsBegin());

    const { org } = getState().userReducer;
    const { uid } = firebaseAuthService.getUser(true);

    console.log({ newSessions });

    // format body
    const body = selectedSession
      ? {
        sid: selectedSession.id,
        sender: uid,
        property: newSessions[0].subject,
        transaction_stripe: 'placeholder',
      }
      : newSessions.map((data) => {
        const start = selectedSession
          ? new Date(selectedSession.info.start._seconds * 1000)
          : new Date(`${data.startDate} ${data.startTime}`);

        const typeInputToDbMap = {
          Classroom: 'free_private_timed',
          'Study Session': 'free_private',
          'Tutoring Session': 'paid_available_timed',
        };

        const addProfilePresenters = data.provider
          ? [data.provider.pid]
          : undefined;

        return {
          sender: uid,
          type: typeInputToDbMap[data.type],
          info: {
            org,
            start,
            name: data.name,
            about: data.about,
            properties: [data.subject],
          },
          addProfilePresenters,
        };
      });

    await apiFetch({
      method: 'POST',
      endpoint: selectedSession ? 'session/paid/scheduled/book' : 'session/multi',
      body: selectedSession ? body : { sessions: body },
    })
      .then(() => {
        dispatch(addSessionsSuccess([]));
        dispatch(getSessionsThunk());
      })
      .catch((error) => {
        console.error('addSessions');
        dispatch(addSessionsFailure(error.message));
      });
  };
}

export function removeSessionThunk({ sid }) {
  return async (dispatch, getState) => {
    dispatch(getSessionsBegin());
    console.log('getState', getState());

    let request;
    if (sid)
      request = apiFetch({
        method: 'DELETE',
        endpoint: `session/multi?sids=${sid}`,
      });
    else
      throw new Error('removeSessionThunk sid must be defined');

    try {
      await Promise.all([request]);
      dispatch(removeSessionSuccess({ sid }));
    } catch (error) {
      console.error(`removeSessionThunk of ${sid}, threw`, error);
      dispatch(removeSessionFailure(error.message));
    }
  };
}

export function editMembersSessionThunk({
  id, gid, addMembers, removeMembers, areLeaders = false,
}) {
  return async (dispatch, getState) => {
    dispatch(getSessionsBegin());
    console.log('getState', getState());
    const { uid } = firebaseAuthService.getUser(true);

    const body = {
      gid,
      areLeaders,
      sender: uid,
      itemId: id,
      addMembers: [...new Set(addMembers)], // avoid duplicate pids
      removeMembers: [...new Set(removeMembers)],
      type: 'session',
    };

    let request;
    if (id)
      request = apiFetch({
        body,
        method: 'PATCH',
        endpoint: 'session/members',
      });
    else
      throw new Error('editUsersThunk id must be defined');

    try {
      const response = await Promise.all([request]);
      dispatch(editUsersSuccess(response));
      dispatch(getSessionsThunk());
    } catch (error) {
      console.error(`editUsersThunk of ${id}, threw`, error);
      dispatch(editUsersFailure(error.message));
    }
  };
}

export function getAvailableSessionsThunk(property) {
  return async (dispatch, getState) => {
    const { org } = getState().userReducer;

    dispatch(getAvailableBegin());

    const start = moment();
    const end = moment().set('hours', 23).set('minutes', 0);

    if (start.minutes() > 30 && start.hours() !== 23)
      // start.add(1, 'hours').set('minutes', 0); // FIXME - testing 10 minute sessions
      start.set('minutes', 0);
    else
      // start.set('minutes', 30); // FIXME - testing 10 minute sessions
      start.set('minutes', 0);

    await apiFetch({
      method: 'GET',
      endpoint: `session/paid/scheduled/book?startString=${start.format(TIME_STRING)}&endString=${end.format(TIME_STRING)}&property=${property}&org=${org}`,
    })
      .then(({ availableSessions }) => {
        dispatch(getAvailableSuccess(
          availableSessions.filter((session) => session && Object.keys(session).length > 0),
        ));
      })
      .catch((error) => dispatch(getAvailableFailure(error)));
  };
}

// ACTIONS
export const getSessionsBegin = () => ({
  type: GET_SESSIONS_BEGIN,
});
export const getSessionsSuccess = (newSessions) => ({
  type: GET_SESSIONS_SUCCESS,
  payload: newSessions,
});
export const getSessionsFailure = (error) => ({
  type: GET_SESSIONS_FAILURE,
  payload: { error },
});

export const addSessionsBegin = () => ({
  type: ADD_SESSIONS_BEGIN,
});
export const addSessionsSuccess = (newSessions) => ({
  type: ADD_SESSIONS_SUCCESS,
  payload: newSessions,
});
export const addSessionsFailure = (error) => ({
  type: ADD_SESSIONS_FAILURE,
  payload: { error },
});

export const removeSessionBegin = () => ({
  type: REMOVE_SESSION_BEGIN,
});
export const removeSessionSuccess = (newSessions) => ({
  type: REMOVE_SESSION_SUCCESS,
  payload: newSessions,
});
export const removeSessionFailure = (error) => ({
  type: REMOVE_SESSION_FAILURE,
  payload: { error },
});

export const editUsersBegin = () => ({
  type: EDIT_USERS_BEGIN,
});
export const editUsersSuccess = (newSessions) => ({
  type: EDIT_USERS_SUCCESS,
  payload: newSessions,
});
export const editUsersFailure = (error) => ({
  type: EDIT_USERS_FAILURE,
  payload: { error },
});

const getAvailableBegin = () => ({
  type: GET_AVAILABLE_BEGIN,
});

const getAvailableSuccess = (availableSessions) => ({
  type: GET_AVAILABLE_SUCCESS,
  payload: availableSessions,
});

const getAvailableFailure = (error) => ({
  type: GET_AVAILABLE_FAILURE,
  payload: { error },
});
