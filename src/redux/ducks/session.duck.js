/* eslint-disable no-use-before-define */
import React from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';

import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import firebaseAuthService from 'services/firebaseAuthService';
import { findGroupByName } from 'services/parsers/group.parser';
import { findProviderPidByName } from 'services/parsers/provider.parser';

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

export function getSessionsThunk(start, end) {
  return async (dispatch, getState) => {
    dispatch(getSessionsBegin());
    console.log('getState', getState());
    const { org } = getState().userReducer;

    try {
      // let queryString;

      // if (start) queryString = `?org=${org}&limit=500&`

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

function isItemValid(item, providerList, properties, org) {
  const inputTypes = ['Classroom', 'Study Session', 'Tutoring Session', 'Links'];
  const inputErrors = [];
  const timestamp = Date.parse(`${item.startDate} ${item.startTime}`);
  const subjectArr = item.subject.map(
    (subject) => properties.includes(subject) || properties.includes(subject.value),
  );

  console.log('ld item', item, inputTypes.includes(item.type[0].value), subjectArr, properties);
  if (!(inputTypes.includes(item.type[0].value) || inputTypes.includes(item.type)))
    inputErrors.push('-- Invalid session type --');
  else if (!item.startDate)
    inputErrors.push('-- No start date --');
  else if (!item.startTime)
    inputErrors.push('-- No start time --');
  else if (isNaN(timestamp))
    inputErrors.push('-- Invalid date and time --');
  else if (!item.about)
    inputErrors.push('-- Invalid description --');
  else if (subjectArr.includes(false))
    inputErrors.push('-- Invalid subject --');
  else if (item.type[0].value === 'Classroom')
    if (!item.provider) {
      inputErrors.push('-- Invalid provider --');
    } else if (typeof item.provider === 'string' && findProviderPidByName(item.provider, providerList, org).includes('Unrecognized name')) {
      inputErrors.push(`-- Invalid provider ${item.provider} --`);
    }

  return inputErrors;
}

export function createSessionsThunk(inputData, selectedSession) {
  return async (dispatch, getState) => {
    try {
      const { userReducer, providersReducer, groupsReducer } = getState();
      const { org, properties } = userReducer;
      const { list: providerList } = providersReducer;
      const { list: groupList } = groupsReducer;
      const { uid } = firebaseAuthService.getUser(true);

      console.log({ inputData });
      let newSessions;
      if (Array.isArray(inputData))
        newSessions = inputData;
      else
        newSessions = [inputData];

      dispatch(addSessionsBegin());

      // input validation
      const inputErrors = newSessions
        .map((item) => isItemValid(item, providerList, properties, org))
        .flat();
      console.log('inputerrors', inputErrors);

      if (inputErrors.length > 0) {
        toast.error(
          <div>
            {inputErrors.map((error) => <div>{error}</div>)}
          </div>,
        );
        dispatch(addSessionsFailure(inputErrors.toString()));
        return false;
      }

      console.log({ newSessions });

      // format body
      let body;
      if (selectedSession) { // if tutor session
        const data = newSessions[0];
        let groupObj; // get group differently if file or form
        if (data.group) // if declared
          if (Array.isArray(data.group)) // if form
            groupObj = data.group[0].value;
          else // if file
            groupObj = findGroupByName(data.group, groupList);
        else
          groupObj = undefined;
        const isOptional = data.isOptional && (Array.isArray(data.isOptional)
          ? data.isOptional[0].value === 'false'
          : data.isOptional === 'false');
        const memberType = isOptional ? 'addProfiles' : 'invitees';
        body = {
          sid: selectedSession.id,
          sender: uid,
          property: newSessions[0].subject[0].value,
          transaction_stripe: 'placeholder',
          [memberType]: groupObj ? groupObj.activeMembers : undefined,
        };
      } else { // for other sessions
        body = newSessions.map((data) => {
          const start = selectedSession
            ? new Date(selectedSession.info.start._seconds * 1000)
            : new Date(`${data.startDate} ${data.startTime}`);

          const typeInputToDbMap = {
            Classroom: 'free_private_timed',
            'Study Session': 'free_private',
            Links: 'free_link',
          // tutoring case handled above 'Tutoring Session': 'paid_available_timed',
          };

          let addProfilePresenters; // get provider differently if file or form
          // console.log("ldldld", data)
          if (data.provider)
            if (Array.isArray(data.provider)) // if form
              addProfilePresenters = [data.provider[0].value.pid];
            else // if file
              addProfilePresenters = [findProviderPidByName(data.provider, providerList, org)];
          else
            addProfilePresenters = undefined;

          let groupObj; // get group differently if file or form
          if (data.group) // if declared
            if (Array.isArray(data.group)) // if form
              groupObj = data.group[0].value;
            else // if file
              groupObj = findGroupByName(data.group, groupList);
          else
            groupObj = undefined;
          // console.log("ldld", addProfilePresenters, groupObj);

          const isOptional = data.isOptional && (Array.isArray(data.isOptional)
            ? data.isOptional[0].value === 'false'
            : data.isOptional === 'false');
          const memberType = isOptional ? 'addProfiles' : 'invitees';
          const sessionType = Array.isArray(data.type) ? data.type[0].value : data.type;
          const sessionProperty = Array.isArray(data.subject)
            ? data.subject[0].value
            : data.subject;
          // console.log('ldprop', data.subject, sessionProperty);
          return {
            sender: uid,
            type: typeInputToDbMap[sessionType],
            docBody: {
              org,
              start,
              name: data.name,
              about: data.about,
              properties: data.subject.map((e) => e.value || e),
              links: data.link ? [data.link] : undefined,
            },
            gid: groupObj ? groupObj.gid : undefined,
            [memberType]: groupObj ? groupObj.activeMembers : undefined,
            addProfilePresenters,
          };
        });
      }

      return apiFetch({
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
    } catch (error) {
      console.log('Error in createSessionsThunk', error);
    }
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
