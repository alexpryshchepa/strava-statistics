import React, { useContext, useRef, useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import cookie from 'js-cookie';
import { getTimestampInSecs, isDateInRange, resetDateTime } from 'utils';
import { getActivities } from 'api';
import AppContext, { Context } from 'store';
import {
  showSnackbar,
  setUserActivitiesLoading,
  setUserActivitiesRange,
  setUserActivitiesData,
  setStats,
  eraseStats,
} from 'store/actions';
import {
  Athlete,
  Activities,
  GetActivitiesRequestParams,
  ActivityType,
} from 'api/types';
import { translateActivityType } from 'api/utils';
import generateStats, { persist } from 'services/statistics';
import { none, fold, some, isSome } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { TimelineLite } from 'gsap';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import s from './Generate.module.scss';

const selectData: ActivityType[] = [
  'EBikeRide',
  'Hike',
  'Ride',
  'Run',
  'Swim',
  'VirtualRide',
  'VirtualRun',
  'Walk',
];

interface Props extends RouteComponentProps {
  info: Athlete;
}

const Statistic: React.FC<Props> = ({ history, info }) => {
  const [state, dispatch] = useContext<Context>(AppContext);

  const [isActivity, setIsActivity] = useState<string>('');
  const [isAll, setIsAll] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);
  const [animation] = useState(new TimelineLite({ paused: true }));

  const [dateFrom, dateTo] = state.user.activities.range;
  const { statistics } = state;
  const isActivitiesLoading = state.user.activities.loading;
  const isGenerationAllowed =
    (isActivity !== '' || isAll) &&
    isDateInRange(dateFrom, [
      resetDateTime(new Date(info.created_at)),
      dateTo,
    ]) &&
    isDateInRange(dateTo, [dateFrom, new Date()]);

  const refHead = useRef(null);
  const refPickers = useRef(null);
  const refSelect = useRef(null);
  const refButton = useRef(null);
  const refLoading = useRef(null);

  const loadActivities = (cb?: () => void) => {
    let currentPage: number = 1;
    let result: Activities = [];

    const load = ({
      after,
      before,
      page,
      per_page,
    }: GetActivitiesRequestParams) => {
      getActivities({
        after,
        before,
        page,
        per_page,
      })
        .then(arr => {
          currentPage++;
          result = result.concat(arr);

          if (per_page && arr.length < per_page) {
            dispatch(setUserActivitiesLoading(false));
            dispatch(
              setStats(
                generateStats(
                  result,
                  isActivity === '' ? none : some(isActivity as ActivityType)
                )
              )
            );

            if (cb) {
              cb();
            }

            return dispatch(setUserActivitiesData(result));
          }

          return load({
            after,
            before,
            page: currentPage,
            per_page,
          });
        })
        .catch(err => {
          dispatch(setUserActivitiesLoading(false));
          dispatch(showSnackbar('error', err.message));

          if (err.type === 'access') {
            cookie.remove('token');
            history.push('/');
          }
        });
    };

    if (!isActivitiesLoading) {
      dispatch(setUserActivitiesLoading(true));

      load({
        after: getTimestampInSecs(dateFrom),
        before: getTimestampInSecs(dateTo),
        page: currentPage,
        per_page: 100,
      });
    }
  };

  const handleGenerate = () => {
    if (isSome(statistics)) {
      dispatch(eraseStats());
    }

    animation
      .to(refHead.current, 0.6, { x: 200, opacity: 0 })
      .to(refPickers.current, 0.55, { x: 160, opacity: 0 }, '-=0.45')
      .to(refSelect.current, 0.5, { x: 120, opacity: 0 }, '-=0.35')
      .to(refButton.current, 0.45, { x: 80, opacity: 0 }, '-=0.25')
      .add(() => setIsFormVisible(false))
      .add(() => loadActivities(() => history.push('/main/stats')))
      .play();
  };

  useEffect(() => {
    if (isAll) {
      setIsActivity('');
    }
  }, [isAll]);

  useEffect(() => {
    if (isActivity !== '') {
      setIsAll(false);
    }
  }, [isActivity]);

  useEffect(() => {
    pipe(
      statistics,
      fold(
        () => {},
        s => persist(info.id, s)
      )
    );
  }, [statistics]); // eslint-disable-line

  return (
    <div className={s.root}>
      {isFormVisible && (
        <>
          <div ref={refHead} className={s.head}>
            <div className={s.title}>
              <Typography variant="h4" component="h4">
                Statistics generator
              </Typography>
            </div>
            <Typography variant="body1" component="p">
              Just a few steps separate you from an awesome thing. Here you can
              select data range and target activity type to generate statistics
              you want.
            </Typography>
          </div>
          <div ref={refPickers} className={s.row}>
            <div className={s.title}>
              <Typography variant="h6" component="h6">
                Select range
              </Typography>
            </div>
            <Paper elevation={3}>
              <div className={s.container}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container spacing={4}>
                    <Grid item md={6} sm={12}>
                      <Typography variant="h6" component="h6">
                        Date from:
                      </Typography>
                      <KeyboardDatePicker
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-from"
                        label="Select date"
                        value={dateFrom}
                        minDate={info.created_at}
                        maxDate={dateTo}
                        onChange={value => {
                          if (value) {
                            dispatch(
                              setUserActivitiesRange([new Date(value), dateTo])
                            );
                          }
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'select date',
                        }}
                      />
                    </Grid>
                    <Grid item md={6} sm={12}>
                      <Typography variant="h6" component="h6">
                        Date to:
                      </Typography>
                      <KeyboardDatePicker
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-to"
                        label="Select date"
                        value={dateTo}
                        minDate={dateFrom}
                        maxDate={new Date()}
                        onChange={value => {
                          if (value) {
                            dispatch(
                              setUserActivitiesRange([
                                dateFrom,
                                new Date(value),
                              ])
                            );
                          }
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'select date',
                        }}
                      />
                    </Grid>
                  </Grid>
                </MuiPickersUtilsProvider>
              </div>
            </Paper>
          </div>
          <div ref={refSelect} className={s.row}>
            <div className={s.title}>
              <Typography variant="h6" component="h6">
                Select activity
              </Typography>
            </div>
            <Grid container justify="center" alignItems="center" spacing={4}>
              <Grid item md sm={12} xs={12}>
                <Paper elevation={3}>
                  <div className={s.container}>
                    <Grid container justify="center">
                      <FormControl>
                        <Select
                          value={isActivity}
                          displayEmpty
                          onChange={(
                            e: React.ChangeEvent<{ value: unknown }>
                          ) => setIsActivity(e.target.value as string)}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {selectData.map(type => (
                            <MenuItem key={type} value={type}>
                              {translateActivityType(type)}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Select activity type</FormHelperText>
                      </FormControl>
                    </Grid>
                  </div>
                </Paper>
              </Grid>
              <Grid item md={1} sm={12} xs={12}>
                <Grid container justify="center">
                  <Typography variant="h6" component="span">
                    or
                  </Typography>
                </Grid>
              </Grid>
              <Grid item md sm={12} xs={12}>
                <Paper elevation={3}>
                  <div className={s.container}>
                    <Grid container justify="center" alignItems="center">
                      <Typography
                        variant="body1"
                        component="span"
                        align="center"
                      >
                        All activity types
                      </Typography>
                      <Switch
                        checked={isAll}
                        onChange={() => setIsAll(!isAll)}
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                      />
                    </Grid>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </div>
          <div ref={refButton}>
            <div className={s.title}>
              <Typography variant="h6" component="h6">
                Push the button
                <span role="img" aria-label="cross fingers">
                  🤞
                </span>
                <span role="img" aria-label="smile">
                  😁
                </span>
              </Typography>
            </div>
            <div
              className={`${s.button} ${
                isGenerationAllowed ? 'animated tada' : ''
              }`}
            >
              <Button
                variant="contained"
                color="secondary"
                disabled={!isGenerationAllowed}
                onClick={() => {
                  if (isGenerationAllowed) {
                    handleGenerate();
                  }
                }}
              >
                Generate
              </Button>
            </div>
          </div>
        </>
      )}
      {isActivitiesLoading && (
        <div ref={refLoading} className={s.waiting}>
          <div className={`${s.waitingText} animated pulse infinite`}>
            <Typography variant="h6" component="h6" align="center">
              Please wait, we are building your statistics
            </Typography>
          </div>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default withRouter(Statistic);
