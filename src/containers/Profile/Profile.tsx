import React, { useState, useContext } from 'react';
import cookie from 'js-cookie';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { fold, isSome } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { logout } from 'api';
import AppContext, { Context } from 'store';
import { showSnackbar } from 'store/actions';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import s from './Profile.module.scss';

const Profile: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [state, dispatch] = useContext<Context>(AppContext);

  const [logoutBusy, setLogoutBusy] = useState<boolean>(false);

  return (
    <div className={s.root}>
      <div className={s.head}>
        <div className={s.logout}>
          <Typography variant="body1" component="span">
            Logout
          </Typography>
          <div className={s.logoutButton}>
            <IconButton
              color="primary"
              aria-label="logout"
              component="span"
              disabled={logoutBusy}
              onClick={() => {
                if (!logoutBusy) {
                  setLogoutBusy(true);

                  logout()
                    .then(() =>
                      dispatch(
                        showSnackbar('success', 'Successfully logged out')
                      )
                    )
                    .catch(err => dispatch(showSnackbar('error', err.message)))
                    .finally(() => {
                      cookie.remove('token');
                      history.push('/');
                    });
                }
              }}
            >
              <ExitToAppIcon />
            </IconButton>
            {logoutBusy && (
              <div className={s.logoutLoader}>
                <CircularProgress size={48} thickness={2} />
              </div>
            )}
          </div>
        </div>
        {pipe(
          state.user.info,
          fold(
            () => <></>,
            ({ firstname, lastname, profile, city }) => (
              <>
                <div className={s.avatar}>
                  <Avatar
                    alt={firstname}
                    src={profile}
                    style={{
                      width: '128px',
                      height: '128px',
                    }}
                  />
                </div>
                <div className={s.name}>
                  <Typography
                    variant="h6"
                    component="span"
                    align="center"
                  >{`${firstname} ${lastname}`}</Typography>
                </div>
                <span className={s.city}>
                  <Typography variant="body1" component="span" align="center">
                    {city}
                  </Typography>
                </span>
              </>
            )
          )
        )}
      </div>
      {isSome(state.statistics) && location.pathname !== '/main/stats' && (
        <div className={s.button}>
          <Link to="/main/stats" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary">
              Go to statistics
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default withRouter(Profile);
