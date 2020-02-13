import React, { useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fold, isNone } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { translateActivityType } from 'api/utils';
import AppContext, { Context } from 'store';
import { showSnackbar } from 'store/actions';
import {
  displayDistance,
  displayTime,
  displayElevation,
  displaySpeed,
  displayRound,
  displayRunningCadence,
} from 'services/statistics';
import domtoimage from 'dom-to-image';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import TableRow from 'components/TableRow';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import MUITableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import s from './Stats.module.scss';

const Stats: React.FC = () => {
  const [state, dispatch] = useContext<Context>(AppContext);

  const [dateFrom, dateTo] = state.user.activities.range;

  const refTotal = useRef<HTMLDivElement>(null);

  const generateImage = () => {
    if (refTotal && refTotal.current) {
      const scale: number = 1.5;

      domtoimage
        .toPng(refTotal.current, {
          width: refTotal.current.clientWidth * scale,
          height: refTotal.current.clientHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          },
        })
        .then(dataUrl => {
          const link = document.createElement('a');
          link.download = 'my-strava-stats.png';
          link.href = dataUrl;
          link.click();
        })
        .catch(err => {
          dispatch(showSnackbar('error', err));
        });
    }
  };

  const handleZero = (num: number, cb: (num: number) => string): string =>
    num > 0 ? cb(num) : '-';

  return (
    <div className={s.root}>
      <div className={s.return}>
        <div className={s.returnButton}>
          <Link to="/main" style={{ textDecoration: 'none' }}>
            <IconButton
              color="primary"
              aria-label="go to generate page"
              component="span"
            >
              <ArrowBackIcon />
            </IconButton>
          </Link>
        </div>
        <Typography variant="body1" component="span">
          Back to setup
        </Typography>
      </div>
      <div className={s.row}>
        <Grid container justify="flex-end">
          <Button
            variant="contained"
            color="secondary"
            disabled={isNone(state.statistics)}
            onClick={generateImage}
          >
            Download
          </Button>
        </Grid>
      </div>
      <div className={s.result}>
        {pipe(
          state.statistics,
          fold(
            () => (
              <div className={s.empty}>
                <Typography variant="h4" component="h4">
                  Not generated yet
                </Typography>
              </div>
            ),
            ({ type, data }) => (
              <>
                <div className={s.base}>
                  <Typography variant="h4" component="h4">
                    {pipe(
                      type,
                      fold(
                        () =>
                          data.total.activities > 0
                            ? `Based on all your activities`
                            : `You don't have any activities`,
                        t =>
                          data.total.activities > 0
                            ? `Based on all your ${translateActivityType(
                                t
                              )} activities`
                            : `You don't have ${translateActivityType(
                                t
                              )} activities`
                      )
                    )}
                  </Typography>
                  <Typography variant="h6" component="h6">
                    {`From: ${moment(dateFrom).format('Do MMMM YYYY')}`}
                  </Typography>
                  <Typography variant="h6" component="h6">
                    {`To: ${moment(dateTo).format('Do MMMM YYYY')}`}
                  </Typography>
                </div>
                {data.total.activities > 0 && (
                  <>
                    <div className={s.row}>
                      <div className={s.title}>
                        <Typography variant="h6" component="h6">
                          Total
                        </Typography>
                      </div>
                      <div ref={refTotal}>
                        <TableContainer component={Paper}>
                          <Table aria-label="table">
                            <TableHead>
                              <MUITableRow>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Value</TableCell>
                              </MUITableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow name="Activities">
                                {data.total.activities}
                              </TableRow>
                              <TableRow name="Distance">
                                {displayDistance(data.total.distance)}
                                &nbsp;km
                              </TableRow>
                              <TableRow name="Time">
                                {displayTime(data.total.time)}
                              </TableRow>
                              <TableRow name="Elevation">
                                {displayElevation(data.total.elevation)}
                                &nbsp;m
                              </TableRow>
                              <TableRow name="Highest point">
                                {displayElevation(data.total.peak)}&nbsp;m
                              </TableRow>
                              <TableRow name="Lowest point">
                                {displayElevation(data.total.bottom)}&nbsp;m
                              </TableRow>
                              <TableRow name="Farthest">
                                <Typography
                                  variant="h6"
                                  component="h6"
                                  color="secondary"
                                >
                                  {displayDistance(
                                    data.total.farthest.distance
                                  )}
                                  &nbsp;km
                                </Typography>
                                <Typography variant="body1" component="span">
                                  <a
                                    href={`https://www.strava.com/activities/${data.total.farthest.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Watch
                                  </a>
                                </Typography>
                              </TableRow>
                              <TableRow name="Longest">
                                <Typography
                                  variant="h6"
                                  component="h6"
                                  color="primary"
                                >
                                  {displayTime(data.total.longest.time)}
                                </Typography>
                                <Typography variant="body1" component="span">
                                  <a
                                    href={`https://www.strava.com/activities/${data.total.longest.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Watch
                                  </a>
                                </Typography>
                              </TableRow>
                              <TableRow name="Honored">
                                <Typography
                                  variant="h6"
                                  component="h6"
                                  color="secondary"
                                >
                                  {data.total.kudoest.kudos}&nbsp;❤
                                </Typography>
                                <Typography variant="body1" component="span">
                                  <a
                                    href={`https://www.strava.com/activities/${data.total.kudoest.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Watch
                                  </a>
                                </Typography>
                              </TableRow>
                              <TableRow name="Highest">
                                <Typography
                                  variant="h6"
                                  component="h6"
                                  color="primary"
                                >
                                  {displayElevation(
                                    data.total.elevatest.elevation
                                  )}
                                  &nbsp;m
                                </Typography>
                                <Typography variant="body1" component="span">
                                  <a
                                    href={`https://www.strava.com/activities/${data.total.elevatest.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Watch
                                  </a>
                                </Typography>
                              </TableRow>
                              <TableRow name="Favorite activity">
                                {pipe(
                                  data.total.favoriteActivity,
                                  fold(
                                    () => 'No favorite activity',
                                    a => translateActivityType(a)
                                  )
                                )}
                              </TableRow>
                              <TableRow name="Preferred time">
                                {pipe(
                                  data.total.timeOfDay,
                                  fold(
                                    () => 'No preferred time',
                                    time => {
                                      switch (time) {
                                        case 'morning':
                                          return 'Morning';
                                        case 'day':
                                          return 'Day';
                                        case 'evening':
                                          return 'Evening';
                                        default:
                                          return '';
                                      }
                                    }
                                  )
                                )}
                              </TableRow>
                              <TableRow name="Favorite day">
                                {pipe(
                                  data.total.favoriteDay,
                                  fold(
                                    () => 'No favorite day',
                                    day =>
                                      day.charAt(0).toUpperCase() + day.slice(1)
                                  )
                                )}
                              </TableRow>
                              <TableRow name="Achievements">
                                {data.total.achievements}
                              </TableRow>
                              <TableRow name="Kudos">
                                {data.total.kudos}
                              </TableRow>
                              <TableRow name="Max heart rate">
                                {handleZero(
                                  data.total.maxHr,
                                  n => `${displayRound(n)}\xa0bpm`
                                )}
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    </div>

                    {isNone(type) && (
                      <div className={s.row}>
                        <div className={s.title}>
                          <Typography variant="h6" component="h6">
                            By activity
                          </Typography>
                          <Typography variant="body2" component="span">
                            * you can scroll the table on the small screens
                          </Typography>
                        </div>
                        <TableContainer component={Paper}>
                          <Table aria-label="table">
                            <TableHead>
                              <MUITableRow>
                                <TableCell>Activity</TableCell>
                                <TableCell align="right">Count</TableCell>
                                <TableCell align="right">Distance</TableCell>
                                <TableCell align="right">Elevation</TableCell>
                                <TableCell align="right">Time</TableCell>
                                <TableCell align="right">Av. speed</TableCell>
                                <TableCell align="right">
                                  Av. heart rate
                                </TableCell>
                                <TableCell align="right">Av. cadence</TableCell>
                                <TableCell align="right">Av. watts</TableCell>
                                <TableCell align="right">Kudos</TableCell>
                              </MUITableRow>
                            </TableHead>
                            <TableBody>
                              {[data.run, data.ride, data.swim]
                                .filter(item => item.activities > 0)
                                .map(row => (
                                  <MUITableRow key={row.type}>
                                    <TableCell component="th" scope="row">
                                      <Typography
                                        variant="body1"
                                        component="span"
                                        color="secondary"
                                      >
                                        {row.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      {row.activities}
                                    </TableCell>
                                    <TableCell align="right">
                                      {displayDistance(row.distance)}
                                      &nbsp;km
                                    </TableCell>
                                    <TableCell align="right">
                                      {displayElevation(row.elevation)}
                                      &nbsp;m
                                    </TableCell>
                                    <TableCell align="right">
                                      {displayTime(row.time)}&nbsp;h
                                    </TableCell>
                                    <TableCell align="right">
                                      {displaySpeed(row.speedAverage)}
                                      &nbsp;kph
                                    </TableCell>
                                    <TableCell align="right">
                                      {handleZero(
                                        row.heartrateAverage,
                                        n => `${displayRound(n)}\xa0bpm`
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {handleZero(row.cadenceAverage, n => {
                                        switch (row.type) {
                                          case 'Run':
                                          case 'VirtualRun':
                                            return `${displayRunningCadence(
                                              n
                                            )}\xa0spm`;
                                          case 'Ride':
                                          case 'VirtualRide':
                                            return `${displayRound(n)}\xa0rpm`;
                                          case 'Swim':
                                            return `${displayRound(n)}\xa0spm`;
                                          default:
                                            return displayRound(n);
                                        }
                                      })}
                                    </TableCell>
                                    <TableCell align="right">
                                      {handleZero(
                                        row.wattsAverage,
                                        n => `${displayRound(n)}\xa0w`
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {row.kudos}&nbsp;❤
                                    </TableCell>
                                  </MUITableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    )}
                  </>
                )}
              </>
            )
          )
        )}
      </div>
    </div>
  );
};

export default Stats;
