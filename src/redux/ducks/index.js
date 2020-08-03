import { combineReducers } from 'redux';

import propertiesReducer from './properties.duck';
import userReducer from './user.duck';

export default combineReducers({
  propertiesReducer,
  userReducer,
});
