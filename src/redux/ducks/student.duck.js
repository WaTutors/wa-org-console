/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

const ADD_STUDENTS_BEGIN = 'ADD_STUDENTS_BEGIN';
const ADD_STUDENTS_SUCCESS = 'ADD_STUDENTS_SUCCESS';
const ADD_STUDENTS_FAILURE = 'ADD_STUDENTS_FAILURE';

// REDUCER

export default function studentsReducer(
  state = initialState.students, action = {},
) {
  switch (action.type) {
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
    default:
      return state;
  }
}

// THUNKS

export function getStudents() {
  return async (dispatch, getState) => {
    dispatch(addStudentsBegin());
    const { org } = getState().user;

    await apiFetch({
      method: 'GET',
      endpoint: `/admin/profiles/consumer/${org}`,
    })
      .then((students) => {
        dispatch(addStudentsSuccess(students));
      })
      .catch((error) => {
        console.error('addStudents');
        dispatch(addStudentsFailure(error.message));
      });
  };
}

export function inviteStudents(newStudents) {
  return async (dispatch, getState) => {
    dispatch(addStudentsBegin());
    const { org } = getState().user;

    await apiFetch({
      method: 'GET',
      endpoint: `/admin/profiles/provider/${org}/`,
      body: {
        newStudents,
        org,
      },
    })
      .then(() => {
        dispatch(addStudentsSuccess(newStudents));
      })
      .catch((error) => {
        console.error('addStudents');
        dispatch(addStudentsFailure(error.message));
      });
  };
}

// ACTIONS

export const addStudentsBegin = () => ({
  type: ADD_STUDENTS_BEGIN,
});
export const addStudentsSuccess = (newStudents) => ({
  type: ADD_STUDENTS_SUCCESS,
  payload: { newStudents },
});
export const addStudentsFailure = (error) => ({
  type: ADD_STUDENTS_FAILURE,
  payload: { error },
});
