/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import firebaseAuthService from 'services/firebaseAuthService';

const GET_STUDENTS_BEGIN = 'GET_STUDENTS_BEGIN';
const GET_STUDENTS_SUCCESS = 'GET_STUDENTS_SUCCESS';
const GET_STUDENTS_FAILURE = 'GET_STUDENTS_FAILURE';

const ADD_STUDENTS_BEGIN = 'ADD_STUDENTS_BEGIN';
const ADD_STUDENTS_SUCCESS = 'ADD_STUDENTS_SUCCESS';
const ADD_STUDENTS_FAILURE = 'ADD_STUDENTS_FAILURE';

const REMOVE_STUDENT_BEGIN = 'REMOVE_STUDENT_BEGIN';
const REMOVE_STUDENT_SUCCESS = 'REMOVE_STUDENT_SUCCESS';
const REMOVE_STUDENT_FAILURE = 'REMOVE_STUDENT_FAILURE';

// REDUCER

export default function studentsReducer(
  state = initialState.students, action = {},
) {
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

    case ADD_STUDENTS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case ADD_STUDENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [...state.list, ...action.payload],
      };
    case ADD_STUDENTS_FAILURE:
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
    default:
      return state;
  }
}

// THUNKS
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
      const uuids = profiles.map((profile) => profile.uuid);
      const profilePhoneNumbers = await getProfileFromPhoneNumber({ uuids });
      console.log({ profilePhoneNumbers });
      profilePhoneNumbers.data.forEach((phone, i) => { profiles[i].phone = phone; });
      // dispatch bullshit
      dispatch(getStudentsSuccess([...profiles, ...invites]));
    } catch (error) {
      console.error('getStudents thunk threw', error);
      dispatch(getStudentsFailure(error.message));
    }
  };
}

export function inviteStudentsThunk(payload) {
  return async (dispatch, getState) => {
    dispatch(addStudentsBegin());
    const newStudents = Array.isArray(payload) ? payload : [payload];
    const { org } = getState().userReducer;
    const { uid } = firebaseAuthService.getUser(true);

    const postedLabels = newStudents[0].labels
      ? newStudents.map((student) => student.labels.split('.')
        .map((str) => str.trim())
        .filter((str) => str.length > 0)) : [];

    return apiFetch({
      method: 'POST',
      endpoint: '/admin/org/invitations',
      body: {
        type: 'org',
        sender: uid,
        itemId: org,
        invitees: newStudents.map((item) => item.phone),
        labels: postedLabels,
        profileType: 'consumer',
        // inviteMsg, // optional
      },
    })
      .then((response) => {
        const newStudentObjs = newStudents.map((item, i) => ({
          to: item.phone,
          labels: postedLabels[i],
          iid: response.iids[i].iid,
        }));
        dispatch(addStudentsSuccess(newStudentObjs));
      })
      .catch((error) => {
        console.error('addStudents');
        dispatch(addStudentsFailure(error.message));
      });
  };
}

export function removeStudentThunk({ pid, iid }) {
  return async (dispatch, getState) => {
    dispatch(getStudentsBegin());
    console.log('getState', getState());
    const { org, uuid } = getState().userReducer;

    let request;
    if (pid) {
      const queryString = `?pids=${pid}${queryString}&limit=500`;
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

// ACTIONS
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

export const addStudentsBegin = () => ({
  type: ADD_STUDENTS_BEGIN,
});
export const addStudentsSuccess = (newStudents) => ({
  type: ADD_STUDENTS_SUCCESS,
  payload: newStudents,
});
export const addStudentsFailure = (error) => ({
  type: ADD_STUDENTS_FAILURE,
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