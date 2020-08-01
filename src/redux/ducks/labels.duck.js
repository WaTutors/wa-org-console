import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

const ADD_PROPERTIES_BEGIN = 'ADD_PROPERTIES_BEGIN';
const ADD_PROPERTIES_SUCCESS = 'ADD_PROPERTIES_SUCCESS';
const ADD_PROPERTIES_FAILURE = 'ADD_PROPERTIES_FAILURE';

// REDUCER

export default function propertiesReducer(
  state = initialState.properties, action = {},
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

export function addProperties(newProperties) {
  return async (dispatch, getState) => {
    dispatch(addProperties());
    const { org } = getState().user;
    await apiFetch({
      method: 'POST',
      endpoint: '/org/property',
      body: {
        newProperties,
        org,
      },
    })
      .then(() => {
        dispatch(addPropertiesSuccess(newProperties));
      })
      .catch((error) => {
        console.error('addProperties');
        dispatch(addPropertiesFailure(error.message));
      });
  };
}

// ACTIONS

export const addPropertiesBegin = () => ({
  type: ADD_PROPERTIES_BEGIN,
});
export const addPropertiesSuccess = (newProperties) => ({
  type: ADD_PROPERTIES_SUCCESS,
  payload: { newProperties },
});
export const addPropertiesFailure = (error) => ({
  type: ADD_PROPERTIES_FAILURE,
  payload: { error },
});
