import { combineReducers } from 'redux';

// import propertiesReducer from './properties.duck';
import studentsReducer from './student.duck';
import providersReducer from './provider.duck';
import userReducer from './user.duck';
import groupsReducer from './group.duck';
import sessionsReducer from './session.duck';
import analyticsReducer from './analytics.duck';

export default combineReducers({
  studentsReducer,
  providersReducer,
  userReducer,
  groupsReducer,
  sessionsReducer,
  analyticsReducer,
});
