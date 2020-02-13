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
import { Athlete, Activities } from 'api/types';
import { Statistics } from 'services/statistics';
import { some } from 'fp-ts/lib/Option';
import { SnackbarSeverity, Action } from './types';

export function showSnackbar(
  severity: SnackbarSeverity,
  message: string
): Action {
  return {
    type: SHOW_SNACKBAR,
    payload: {
      severity,
      message,
    },
  };
}

export function hideSnackbar(): Action {
  return {
    type: HIDE_SNACKBAR,
  };
}

export function setUserInfo(info: Athlete): Action {
  return {
    type: SET_USER_INFO,
    payload: some(info),
  };
}

export function setUserActivitiesLoading(loading: boolean): Action {
  return {
    type: SET_USER_ACTIVITIES_LOADING,
    payload: loading,
  };
}

export function setUserActivitiesRange(range: [Date, Date]): Action {
  return {
    type: SET_USER_ACTIVITIES_RANGE,
    payload: range,
  };
}

export function setUserActivitiesData(data: Activities): Action {
  return {
    type: SET_USER_ACTIVITIES_DATA,
    payload: data,
  };
}

export function setStats(data: Statistics): Action {
  return {
    type: SET_STATS,
    payload: some(data),
  };
}

export function eraseStats(): Action {
  return {
    type: ERASE_STATS,
  };
}
