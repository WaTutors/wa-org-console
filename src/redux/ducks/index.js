import { combineReducers } from 'redux';

import propertiesReducer from './properties.duck';
import studentsReducer from './student.duck';
import providersReducer from './provider.duck';
import userReducer from './user.duck';
import groupsReducer from './group.duck';

export default combineReducers({
  propertiesReducer,
  studentsReducer,
  providersReducer,
  userReducer,
  groupsReducer,
});
