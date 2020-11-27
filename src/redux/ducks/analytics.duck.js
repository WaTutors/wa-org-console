/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';

// SECTION - Variables

const FETCH_ANALYTICS_BEGIN = 'FETCH_ANALYTICS_BEGIN';
const FETCH_ANALYTICS_SUCCESS = 'FETCH_ANALYTICS_SUCCESS';
const FETCH_ANALYTICS_FAILURE = 'FETCH_ANALYTICS_FAILURE';

// !SECTION

// SECTION - Reducer

export default function analyticsReducer(state = initialState.analytics, action = {}) {
  switch (action.type) {
    case FETCH_ANALYTICS_BEGIN:
      return {
        ...state,
        error: null,
        loading: true,
      };

    case FETCH_ANALYTICS_SUCCESS:
      return {
        ...state,
        analytics: action.payload.analytics,
        loading: false,
      };

    case FETCH_ANALYTICS_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };

    default:
      return state;
  }
}

// !SECTION

// SECTION - Thunks

export function getAnalyticsThunk(properties) {
  return async (dispatch) => {
    dispatch(fetchAnalyticsBegin());

    apiFetch({
      method: 'GET',
      endpoint: `analytics/summary?properties=${properties.join()}`,
    })
      .then(({ bookedSessions }) => {
        dispatch(fetchAnalyticsSuccess(bookedSessions));
      })
      .catch((error) => {
        dispatch(fetchAnalyticsFailure(error));
      });
  };
}

// !SECTION

// SECTION - Actions

const fetchAnalyticsBegin = () => ({
  type: FETCH_ANALYTICS_BEGIN,
});

const fetchAnalyticsSuccess = (analytics) => ({
  type: FETCH_ANALYTICS_SUCCESS,
  payload: { analytics },
});

const fetchAnalyticsFailure = (error) => ({
  type: FETCH_ANALYTICS_FAILURE,
  payload: { error },
});

// !SECTION
