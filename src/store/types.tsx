import { Athlete, Activities } from 'api/types';
import { Statistics } from 'services/statistics';
import { Option } from 'fp-ts/lib/Option';
import * as constants from './constants';

type User = {
  info: Option<Athlete>;
  activities: {
    loading: boolean;
    range: [Date, Date];
    data: Activities;
  };
};

export type SnackbarSeverity = 'success' | 'warning' | 'info' | 'error';

type Snackbar = {
  visible: boolean;
  severity: SnackbarSeverity;
  message: string;
};

export type State = {
  snackbar: Snackbar;
  user: User;
  statistics: Option<Statistics>;
};

type InferValueTypes<T> = T extends { [key: string]: infer U } ? U : never;

type ActionType = InferValueTypes<typeof constants>;

export type Action = {
  type: ActionType;
  // FIXME: Really unsafe place
  payload?: any;
};
