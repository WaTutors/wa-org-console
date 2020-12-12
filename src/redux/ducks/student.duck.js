/* eslint-disable no-use-before-define */
import React from 'react';
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import { formatContactForDb } from 'services/formatContactInfo';
import firebaseAuthService from 'services/firebaseAuthService';
import { toast } from 'react-toastify';

const GET_STUDENTS_BEGIN = 'GET_STUDENTS_BEGIN';
const GET_STUDENTS_SUCCESS = 'GET_STUDENTS_SUCCESS';
const GET_STUDENTS_FAILURE = 'GET_STUDENTS_FAILURE';

const INVITE_STUDENTS_BEGIN = 'INVITE_STUDENTS_BEGIN';
const INVITE_STUDENTS_SUCCESS = 'INVITE_STUDENTS_SUCCESS';
const INVITE_STUDENTS_FAILURE = 'INVITE_STUDENTS_FAILURE';

const EDIT_STUDENT_BEGIN = 'EDIT_STUDENT_BEGIN';
const EDIT_STUDENT_SUCCESS = 'EDIT_STUDENT_SUCCESS';
const EDIT_STUDENT_FAILURE = 'EDIT_STUDENT_FAILURE';

const REMOVE_STUDENT_BEGIN = 'REMOVE_STUDENT_BEGIN';
const REMOVE_STUDENT_SUCCESS = 'REMOVE_STUDENT_SUCCESS';
const REMOVE_STUDENT_FAILURE = 'REMOVE_STUDENT_FAILURE';

const CREATE_STUDENTS_BEGIN = 'CREATE_STUDENTS_BEGIN';
const CREATE_STUDENTS_SUCCESS = 'CREATE_STUDENTS_SUCCESS';
const CREATE_STUDENTS_FAILURE = 'CREATE_STUDENTS_FAILURE';

// SECTION - Reducer

export default function studentsReducer(state = initialState.students, action = {}) {
  switch (action.type) {
    case GET_STUDENTS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case GET_STUDENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case GET_STUDENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case INVITE_STUDENTS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case INVITE_STUDENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [...state.list, ...action.payload],
      };
    case INVITE_STUDENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case EDIT_STUDENT_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case EDIT_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.map((el) => {
          if (el.pid === action.payload.pid)
            return action.payload;
          return el;
        }),
      };
    case EDIT_STUDENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case REMOVE_STUDENT_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case REMOVE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.filter((el) => {
          if (el.pid)
            return el.pid !== action.payload.pid;
          return el.iid !== action.payload.iid;
        }),
      };
    case REMOVE_STUDENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CREATE_STUDENTS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_STUDENTS_SUCCESS:
      return {
        ...state,
        created: action.payload.created,
        loading: false,
      };

    case CREATE_STUDENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
}

// !SECTION

// SECTION - Thunks

const getProfileFromPhoneNumber = firebaseAuthService
  .generateCallableFunction('getPhoneNumberFromProfile');

export function getStudentsThunk() {
  return async (dispatch, getState) => {
    dispatch(getStudentsBegin());
    const { org } = getState().userReducer;

    try {
      const studentsObj = await apiFetch({
        method: 'GET',
        endpoint: `admin/profiles/consumer/${org}`,
      });
      // get phone numbers
      const { profiles, invites } = studentsObj;
      const openInvites = invites.filter((inv) => inv.state !== 'accept');
      const uuids = profiles.map((profile) => profile.uuid);
      const profilePhoneNumbers = await getProfileFromPhoneNumber({ uuids });
      console.log({ profilePhoneNumbers });
      profilePhoneNumbers.data.forEach((phone, i) => { profiles[i].phone = phone; });
      // dispatch bullshit
      dispatch(getStudentsSuccess([...profiles, ...openInvites]));
    } catch (error) {
      console.error('getStudents thunk threw', error);
      dispatch(getStudentsFailure(error.message));
    }
  };
}

export function inviteStudentsThunk(payload) {
  return async (dispatch, getState) => {
    dispatch(inviteStudentsBegin());
    try {
      const newStudents = Array.isArray(payload) ? payload : [payload];
      const { org } = getState().userReducer;
      const { uid } = firebaseAuthService.getUser(true);

      const postedLabels = newStudents.map((_) => []);

      newStudents.forEach((student, i) => {
        if (student.fromParseFile)
          Object.entries(student).forEach(([key, val]) => {
            if (!['phone', 'labels'].includes(key))
              if (val === true) // parse checkbox UI
                postedLabels[i].push(`${val}`.trim());
              else if (Array.isArray(val)) // for select UI
                val.map((v) => postedLabels[i].push(`${v.value}`.trim()));
              else if (typeof val === 'string')
                val.split('.').forEach((v) => v && postedLabels[i].push(`${v.trim()}`));
          });
        else
          Object.entries(student).forEach(([key, val]) => {
            if (!['phone', 'labels'].includes(key))
              if (val === true) // parse checkbox UI
                postedLabels[i].push(`${val}`.trim());
              else if (Array.isArray(val)) // for select UI
                val.map((v) => postedLabels[i].push(`${v.value}`));
              else if (typeof val === 'string')
                postedLabels[i].push(`${key}_${val.trim()}`);
          });
      });

      const contactInfoArr = newStudents
        .map((student) => formatContactForDb(student.phone));
      if (contactInfoArr.includes(false)) {
        toast.error('-- Invalid phone number or email --');
        dispatch(inviteStudentsFailure('-- Invalid phone number or email --'));
        return false;
      }

      return apiFetch({
        method: 'POST',
        endpoint: '/admin/org/invitations',
        body: {
          type: 'org',
          sender: uid,
          itemId: org,
          invitees: contactInfoArr,
          labels: postedLabels,
          profileType: 'consumer',
        // inviteMsg, // optional
        },
      })
        .then((response) => {
          const newStudentObjs = newStudents.map((item, i) => ({
            to: formatContactForDb(item.phone),
            labels: postedLabels[i],
            iid: response.iids[i].iid,
          }));
          dispatch(inviteStudentsSuccess(newStudentObjs));
        })
        .catch((error) => {
          console.error('inviteStudents');
          dispatch(inviteStudentsFailure(error.message));
        });
    } catch (error) {
      console.log('Error with ', error);
    }
  };
}

/**
 *
 * @param {*} payload
 */
export function editStudentThunk(payload) {
  return async (dispatch, getState) => {
    dispatch(editStudentBegin());
    console.log({ payload });
    try {
      console.log('getState', getState());
      const { org, uuid } = getState().userReducer;
      const { list } = getState().studentsReducer;

      let request;
      // validate and format payload
      const inputErrors = [];
      const { pid, properties } = payload;
      let studentObj;
      if (pid)
        studentObj = list.find((el) => el.pid === pid);
      if (!studentObj)
        inputErrors.push('-- Provider not found from id --');
      // abort if validation errors
      if (inputErrors.length > 0) {
        toast.error(
          <div>
            {inputErrors.map((error) => <div>{error}</div>)}
          </div>,
        );
        dispatch(editStudentFailure(inputErrors.toString()));
        return false;
      }
      // format
      const pArr = properties ? properties.map((el) => `${org}_${el.value}`) : []; // new properties array from form
      const pArrPrev = studentObj.profile.properties
        ? studentObj.profile.properties.filter((property) => property.includes(`${org}_`))
        : [];
      const addProperties = pArr.filter((el) => !pArrPrev.includes(el)); // properties added
      const removeProperties = pArrPrev.filter((el) => !pArr.includes(el)); // properties removed
      console.log('consumer filter', {
        properties, pid, studentObj, pArrPrev, pArr, addProperties, removeProperties,
      });
      const body = {
        pid,
        ...(properties && addProperties.length > 0
          ? { addProperties } // new items
          : {}), // nothing
        ...(properties && removeProperties.length > 0
          ? { removeProperties }
          : {}), // nothing
        // addLabels: ,
        // removeLabels: ,
      };

      await apiFetch({
        method: 'PATCH',
        endpoint: `admin/profiles/consumer/${org}`,
        body,
      });
      await Promise.all([request]);
      const newProfile = {
        ...studentObj,
        profile: {
          ...studentObj.profile,
          properties: pArr,
        },
      };
      dispatch(editStudentSuccess(newProfile));
    } catch (error) {
      console.error('editStudentThunk threw', error);
      dispatch(editStudentFailure(error.message));
    }
  };
}

export function removeStudentThunk({ pid, iid }) {
  return async (dispatch, getState) => {
    dispatch(getStudentsBegin());
    console.log('getState', getState());
    const { org, uuid } = getState().userReducer;

    let request;
    if (pid) {
      const queryString = `?pids=${pid}&limit=500`;
      request = apiFetch({
        method: 'DELETE',
        endpoint: `admin/profiles/consumer/${org}${queryString}`,
      });
    } else if (iid) {
      request = apiFetch({
        method: 'DELETE',
        endpoint: `admin/org/invitations?iids=${iid}`,
      });
    } else { throw new Error('removeStudentThunk pid or iid must be defined'); }

    try {
      await Promise.all([request]);
      dispatch(removeStudentSuccess({ pid, iid }));
    } catch (error) {
      console.error(`removeStudentThunk of ${pid || iid}, threw`, error);
      dispatch(removeStudentFailure(error.message));
    }
  };
}

/**
 * Creates simulated students.
 *
 * Based on parsed profiles inputted and current simulation organization ID, creates profile
 * documents for all students.
 *
 * @param {array}  students Array of student profiles to create.
 */
export function createStudentsThunk(students) {
  return async (dispatch, getState) => {
    const { org } = getState().userReducer;

    dispatch(createStudentsBegin());

    await Promise.all(students.map(({ properties }, index) => apiFetch({
      method: 'POST',
      endpoint: 'profile/single/consumer',
      body: {
        uuid: `sim-consumer-${Math.round(new Date().getTime() / 1000)}${index}`,
        type: 'consumer',
        profile: {
          name: `Student ${Math.round(new Date().getTime() / 1000)}${index}`,
          about: 'Simulated student',
          properties,
          org: ['watutor_default', org],
        },
      },
    })))
      .then((profiles) => {
        dispatch(createStudentsSuccess(profiles.map(({ posted }) => posted)));
      })
      .catch((error) => {
        dispatch(createStudentsFailure(error));
      });
  };
}

// !SECTION

// SECTION - Actions

export const getStudentsBegin = () => ({
  type: GET_STUDENTS_BEGIN,
});
export const getStudentsSuccess = (newStudents) => ({
  type: GET_STUDENTS_SUCCESS,
  payload: newStudents,
});
export const getStudentsFailure = (error) => ({
  type: GET_STUDENTS_FAILURE,
  payload: { error },
});

export const inviteStudentsBegin = () => ({
  type: INVITE_STUDENTS_BEGIN,
});
export const inviteStudentsSuccess = (newStudents) => ({
  type: INVITE_STUDENTS_SUCCESS,
  payload: newStudents,
});
export const inviteStudentsFailure = (error) => ({
  type: INVITE_STUDENTS_FAILURE,
  payload: { error },
});

export const editStudentBegin = () => ({
  type: EDIT_STUDENT_BEGIN,
});
export const editStudentSuccess = (newStudents) => ({
  type: EDIT_STUDENT_SUCCESS,
  payload: newStudents,
});
export const editStudentFailure = (error) => ({
  type: EDIT_STUDENT_FAILURE,
  payload: { error },
});

export const removeStudentBegin = () => ({
  type: REMOVE_STUDENT_BEGIN,
});
export const removeStudentSuccess = (newStudents) => ({
  type: REMOVE_STUDENT_SUCCESS,
  payload: newStudents,
});
export const removeStudentFailure = (error) => ({
  type: REMOVE_STUDENT_FAILURE,
  payload: { error },
});

const createStudentsBegin = () => ({
  type: CREATE_STUDENTS_BEGIN,
});

export const createStudentsSuccess = (created) => ({
  type: CREATE_STUDENTS_SUCCESS,
  payload: { created },
});

const createStudentsFailure = (error) => ({
  type: CREATE_STUDENTS_FAILURE,
  payload: { error },
});

// !SECTION
