import initialState from './state';
import { State, Action } from './types';
import { none } from 'fp-ts/lib/Option';
import {
  SHOW_SNACKBAR,
  HIDE_SNACKBAR,
  SET_USER_INFO,
  SET_USER_ACTIVITIES_LOADING,
  SET_USER_ACTIVITIES_RANGE,
  SET_USER_ACTIVITIES_DATA,
  SET_STATS,
  ERASE_STATS,
} from './constants';

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case SHOW_SNACKBAR:
      return {
        ...state,
        snackbar: {
          visible: true,
          severity: action.payload.severity,
          message: action.payload.message,
        },
      };
    case HIDE_SNACKBAR:
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          visible: false,
        },
      };
    case SET_USER_INFO:
      return {
        ...state,
        user: {
          ...state.user,
          info: action.payload,
        },
      };
    case SET_USER_ACTIVITIES_LOADING:
      return {
        ...state,
        user: {
          ...state.user,
          activities: {
            ...state.user.activities,
            loading: action.payload,
          },
        },
      };
    case SET_USER_ACTIVITIES_RANGE:
      return {
        ...state,
        user: {
          ...state.user,
          activities: {
            ...state.user.activities,
            range: action.payload,
          },
        },
      };
    case SET_USER_ACTIVITIES_DATA:
      return {
        ...state,
        user: {
          ...state.user,
          activities: {
            ...state.user.activities,
            data: action.payload,
          },
        },
      };
    case SET_STATS:
      return {
        ...state,
        statistics: action.payload,
      };
    case ERASE_STATS:
      return {
        ...state,
        statistics: none,
      };
    default:
      return state;
  }
};
