/* eslint-disable no-use-before-define */
import initialState from 'redux/initialState';
import apiFetch from 'redux/helpers/apiFetch';
import firebaseAuthService from 'services/firebaseAuthService';

const GET_PROVIDERS_BEGIN = 'GET_PROVIDERS_BEGIN';
const GET_PROVIDERS_SUCCESS = 'GET_PROVIDERS_SUCCESS';
const GET_PROVIDERS_FAILURE = 'GET_PROVIDERS_FAILURE';

const ADD_PROVIDERS_BEGIN = 'ADD_PROVIDERS_BEGIN';
const ADD_PROVIDERS_SUCCESS = 'ADD_PROVIDERS_SUCCESS';
const ADD_PROVIDERS_FAILURE = 'ADD_PROVIDERS_FAILURE';

const REMOVE_PROVIDER_BEGIN = 'REMOVE_PROVIDER_BEGIN';
const REMOVE_PROVIDER_SUCCESS = 'REMOVE_PROVIDER_SUCCESS';
const REMOVE_PROVIDER_FAILURE = 'REMOVE_PROVIDER_FAILURE';
// REDUCER

export default function providersReducer(
  state = initialState.providers, action = {},
) {
  switch (action.type) {
    case GET_PROVIDERS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case GET_PROVIDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case GET_PROVIDERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_PROVIDERS_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case ADD_PROVIDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [...state.list, ...action.payload],
      };
    case ADD_PROVIDERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case REMOVE_PROVIDER_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case REMOVE_PROVIDER_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.filter((el) => {
          if (el.pid)
            return el.pid !== action.payload.pid;
          return el.iid !== action.payload.iid;
        }),
      };
    case REMOVE_PROVIDER_FAILURE:
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

export function getProvidersThunk() {
  return async (dispatch, getState) => {
    dispatch(getProvidersBegin());
    console.log('getState', getState());
    const { org } = getState().userReducer;

    try {
      const providersObj = await apiFetch({
        method: 'GET',
        endpoint: `admin/profiles/provider/${org}`,
      });
      // get phone numbers
      const { profiles, invites } = providersObj;
      const uuids = profiles.map((profile) => profile.uuid);
      const profilePhoneNumbers = await getProfileFromPhoneNumber({ uuids });
      console.log({ profilePhoneNumbers });
      if (profilePhoneNumbers.data)
        profilePhoneNumbers.data.forEach((phone, i) => {
          if (typeof phone === 'string')
            profiles[i].phone = phone;
        });
      // dispatch bullshit
      dispatch(getProvidersSuccess([...profiles, ...invites]));
    } catch (error) {
      console.error('getProviders thunk threw', error);
      dispatch(getProvidersFailure(error.message));
    }
  };
}

export function inviteProvidersThunk(newProviders) {
  return async (dispatch, getState) => {
    dispatch(addProvidersBegin());
    console.log('inviteProvidersThunk state', firebaseAuthService.getUser());
    const { org } = getState().userReducer;
    const { uid } = firebaseAuthService.getUser(true);

    await apiFetch({
      method: 'POST',
      endpoint: '/admin/org/invitations',
      body: {
        type: 'org',
        sender: uid,
        itemId: org,
        invitees: newProviders,
        profileType: 'provider',
        // inviteMsg, // optional
      },
    })
      .then(() => {
        dispatch(addProvidersSuccess(newProviders));
      })
      .catch((error) => {
        console.error('addProviders');
        dispatch(addProvidersFailure(error.message));
      });
  };
}

export function removeProviderThunk({ pid, iid }) {
  return async (dispatch, getState) => {
    dispatch(getProvidersBegin());
    console.log('getState', getState());
    const { org, uuid } = getState().userReducer;

    let request;
    if (pid) {
      const queryString = `?pids=${pid}`;
      request = apiFetch({
        method: 'DELETE',
        endpoint: `admin/profiles/provider/${org}${queryString}`,
      });
    } else if (iid) {
      request = apiFetch({
        method: 'DELETE',
        endpoint: `admin/org/invitations?iids=${iid}`,
      });
    } else { throw new Error('removeProviderThunk pid or iid must be defined'); }

    try {
      await Promise.all([request]);
      dispatch(removeProviderSuccess({ pid, iid }));
    } catch (error) {
      console.error(`removeProviderThunk of ${pid || iid}, threw`, error);
      dispatch(removeProviderFailure(error.message));
    }
  };
}

// ACTIONS
export const getProvidersBegin = () => ({
  type: GET_PROVIDERS_BEGIN,
});
export const getProvidersSuccess = (newProviders) => ({
  type: GET_PROVIDERS_SUCCESS,
  payload: newProviders,
});
export const getProvidersFailure = (error) => ({
  type: GET_PROVIDERS_FAILURE,
  payload: { error },
});

export const addProvidersBegin = () => ({
  type: ADD_PROVIDERS_BEGIN,
});
export const addProvidersSuccess = (newProviders) => ({
  type: ADD_PROVIDERS_SUCCESS,
  payload: newProviders,
});
export const addProvidersFailure = (error) => ({
  type: ADD_PROVIDERS_FAILURE,
  payload: { error },
});

export const removeProviderBegin = () => ({
  type: REMOVE_PROVIDER_BEGIN,
});
export const removeProviderSuccess = (newProviders) => ({
  type: REMOVE_PROVIDER_SUCCESS,
  payload: newProviders,
});
export const removeProviderFailure = (error) => ({
  type: REMOVE_PROVIDER_FAILURE,
  payload: { error },
});
