/* eslint-disable no-await-in-loop */
/* eslint-disable no-use-before-define */
import moment from 'moment';

import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import { createStudentsSuccess, createStudentsThunk, getStudentsThunk } from './student.duck';
import { createProvidersSuccess, createProvidersThunk, getProvidersThunk } from './provider.duck';
import { getOrgSummaryThunk, setOrgSummaryPropertiesThunk } from './user.duck';
import {
  addAvailabilityThunk, createSessionsThunk, getAvailableSessionsThunk,
} from './session.duck';

// SECTION - Variables

const FETCH_ANALYTICS_BEGIN = 'FETCH_ANALYTICS_BEGIN';
const FETCH_ANALYTICS_SUCCESS = 'FETCH_ANALYTICS_SUCCESS';
const FETCH_ANALYTICS_FAILURE = 'FETCH_ANALYTICS_FAILURE';

const RUN_SIMULATION_BEGIN = 'RUN_SIMULATION_BEGIN';
const RUN_SIMULATION_SUCCESS = 'RUN_SIMULATION_SUCCESS';
const RUN_SIMULATION_FAILURE = 'RUN_SIMULATION_FAILURE';

const CLEAR_DATA_BEGIN = 'CLEAR_DATA_BEGIN';
const CLEAR_DATA_SUCCESS = 'CLEAR_DATA_SUCCESS';
const CLEAR_DATA_FAILURE = 'CLEAR_DATA_FAILURE';

const SET_STATUS = 'SET_STATUS';

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

    case RUN_SIMULATION_BEGIN:
      return {
        ...state,
        error: null,
      };

    case RUN_SIMULATION_SUCCESS:
      return {
        ...state,
        payload: action.payload.payload,
      };

    case RUN_SIMULATION_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };

    case CLEAR_DATA_BEGIN:
      return {
        ...state,
        error: null,
        loading: true,
      };

    case CLEAR_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case CLEAR_DATA_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };

    case SET_STATUS:
      return {
        ...state,
        status: action.payload.status,
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

    await apiFetch({
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function mode(array) {
  const modeMap = {};
  let maxEl = array[0];
  let maxCount = 1;

  for (let i = 0; i < array.length; i += 1) {
    const el = array[i];

    if (modeMap[el] == null)
      modeMap[el] = 1;
    else
      modeMap[el] += 1;

    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}

export function runSimulationThunk({
  days, categories, students, instructors, available, acceptance, searches, time,
}) {
  return async (dispatch, getState) => {
    const { org } = getState().userReducer;

    dispatch(runSimulationBegin());

    let generatedCategories = new Array(categories).fill()
      .map((_, index) => `Category ${index + 1}`);

    await dispatch(setOrgSummaryPropertiesThunk(generatedCategories));

    generatedCategories = generatedCategories.map((property) => `${org}_${property}`);

    dispatch(setStatus('Generating students and providers...'));

    await Promise.all([
      dispatch(createStudentsThunk(new Array(students).fill()
        .map(() => ({ properties: generatedCategories })))),
      dispatch(createProvidersThunk(new Array(instructors).fill()
        .map(() => ({ properties: generatedCategories })))),
    ]);

    const alerts = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
      const currentDay = moment.weekdays()[moment().weekday() + dayIndex]; // "Monday," "Tuesday"
      const yesterday = dayIndex > 0
        ? moment.weekdays()[moment().weekday() + dayIndex - 1]
        : null;

      // SECTION - Availability

      dispatch(setStatus(`Day ${dayIndex + 1} - Adding availability...`));

      await dispatch(addAvailabilityThunk(new Array(instructors).fill()
        .flatMap((_, index) => {
          let firstHour = null;
          // const nextHours = [];

          if (alerts[yesterday] && alerts[yesterday].length > 0
            && getRandomInt(0, 101) <= acceptance)
            firstHour = alerts[yesterday][0].hour; // TODO - select other alerts
          else
            firstHour = 18; // default hour of availability
            // firstHour = getRandomInt(8, 21);

          // new Array(available - 1).fill().forEach(() => {
          //   let hour = getRandomInt(8, 21);

          //   while (nextHours.includes(hour) || hour === firstHour) // ensures each hour is unique
          //     hour = getRandomInt(8, 21);

          //   nextHours.push(hour);
          // });

          return new Array(available).fill()
            .map((__, availableIndex) => {
              const {
                pid, profile: { name, about, properties },
              } = getState().providersReducer.created[index];

              const start = moment().set('date', moment().date() + dayIndex)
                .set('minutes', 0)
                .set('seconds', 0)
                .set('milliseconds', 0);

              if (availableIndex === 0)
                start.set('hours', firstHour);
              else
                // start.set('hours', nextHours[availableIndex - 1]);
                start.set('hours', 18);

              return {
                pid,
                name,
                about,
                properties,
                start,
                end: start.clone().add(1, 'hour'),
              };
            });
        })));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // !SECTION

      dispatch(setStatus(`Day ${dayIndex + 1} - Performing searches...`));

      for (let i = 0; i < students; i += 1)
        for (let j = 0; j < searches; j += 1) {
          const start = moment()
            .set('date', moment().date() + dayIndex)
            .set('hours', time)
            .set('minutes', 0)
            .set('seconds', 0)
            .set('milliseconds', 0);

          const property = generatedCategories[Math.floor(Math.random() * categories)];

          await dispatch(getAvailableSessionsThunk(
            property,
            start,
            start.clone().add(1, 'hour'),
          ))
            .then(async () => {
              const {
                sessionsReducer: { availableSessions },
                studentsReducer: { created },
              } = getState();

              if (availableSessions.length > 0)
                await dispatch(createSessionsThunk(
                  {
                    isOptional: true,
                    subject: [{ value: property }],
                    group: [{ value: { activeMembers: [created[i].pid] } }],
                    type: [{ value: 'Tutoring Session' }],
                  },
                  { id: availableSessions[0].sid },
                ));
            });

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

      dispatch(setStatus(`Day ${dayIndex + 1} - Refreshing analytics...`));

      await dispatch(getAnalyticsThunk(generatedCategories));

      // SECTION - Recommendations

      dispatch(setStatus(`Day ${dayIndex + 1} - Calculating recommendation...`));

      const { analytics } = getState().analyticsReducer;

      const { trends } = Object.values(analytics)[0];
      const { booked, searches: realSearches } = trends[currentDay];

      const yesterdayBooked = trends[yesterday]?.booked ?? [];
      const yesterdaySearches = trends[yesterday]?.searches ?? [];

      const todayDiff = realSearches.length - booked.length;
      const yesterdayDiff = yesterdaySearches.length - yesterdayBooked.length;

      if (todayDiff > 0)
        // if our previous alert exists and was successful
        if (alerts[yesterday] && alerts[yesterday].length > 0 && yesterdayDiff > todayDiff)
          alerts[currentDay].push({
            instructors: (todayDiff * yesterdayDiff) / Math.abs(yesterdayDiff - todayDiff),
            hour: mode(realSearches.map(({ _seconds }) => moment(_seconds * 1000).hours())),
          });
        else
          alerts[currentDay].push({
            instructors: realSearches.length - booked.length,
            hour: mode(realSearches.map(({ _seconds }) => moment(_seconds * 1000).hours())),
          });

      console.log(alerts);

      // !SECTION
    }
  };
}

export function clearOrgDataThunk() {
  return async (dispatch, getState) => {
    const { properties, org } = getState().userReducer;

    dispatch(clearDataBegin());

    await apiFetch({
      method: 'POST',
      endpoint: 'testing/delete',
      body: {
        analytics: properties.map((property) => `${org}_${property}`),
        pids: [],
        gids: [],
        sids: [],
        iids: [],
      },
    })
      .then(() => {
        dispatch(getOrgSummaryThunk());
        dispatch(getProvidersThunk());
        dispatch(getStudentsThunk());
        dispatch(createProvidersSuccess([]));
        dispatch(createStudentsSuccess([]));
        dispatch(clearDataSuccess());
      })
      .catch((error) => {
        dispatch(clearDataFailure(error));
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

const runSimulationBegin = () => ({
  type: RUN_SIMULATION_BEGIN,
});

const runSimulationSuccess = (payload) => ({
  type: RUN_SIMULATION_SUCCESS,
  payload: { payload },
});

const runSimulationFailure = (error) => ({
  type: RUN_SIMULATION_FAILURE,
  payload: { error },
});

const clearDataBegin = () => ({
  type: CLEAR_DATA_BEGIN,
});

const clearDataSuccess = () => ({
  type: CLEAR_DATA_SUCCESS,
});

const clearDataFailure = (error) => ({
  type: CLEAR_DATA_FAILURE,
  payload: { error },
});

const setStatus = (status) => ({
  type: SET_STATUS,
  payload: { status },
});

// !SECTION
