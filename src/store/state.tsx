import { State } from './types';
import { none } from 'fp-ts/lib/Option';

const state: State = {
  snackbar: {
    visible: false,
    severity: 'success',
    message: '',
  },
  user: {
    info: none,
    activities: {
      loading: false,
      range: [new Date(), new Date()],
      data: [],
    },
  },
  statistics: none,
};

export default state;
