import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  withRouter,
  RouteComponentProps,
  useLocation,
  Route,
  Switch,
} from 'react-router-dom';
import cookie from 'js-cookie';
import { getUser } from 'api';
import { Athlete } from 'api/types';
import AppContext, { Context } from 'store';
import {
  setUserInfo,
  showSnackbar,
  setUserActivitiesRange,
  setStats,
} from 'store/actions';
import { fold, isNone, fromNullable } from 'fp-ts/lib/Option';
import { read, clear } from 'services/statistics';
import { pipe } from 'fp-ts/lib/pipeable';
import NotFound from 'pages/NotFound';
import Stats from 'containers/Stats/Stats';
import Profile from 'containers/Profile/Profile';
import Generate from 'containers/Generate/Generate';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Backdrop from '@material-ui/core/Backdrop';
import MenuIcon from '@material-ui/icons/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import CircularProgress from '@material-ui/core/CircularProgress';
import s from './Main.module.scss';

const Main: React.FC<RouteComponentProps> = ({ history, match }) => {
  const [state, dispatch] = useContext<Context>(AppContext);
  const [isProfileVisible, setIsProfileVisible] = useState<boolean>(false);
  const { pathname } = useLocation<RouteComponentProps>();
  const { info } = state.user;

  const refBar = useRef<HTMLDivElement>(null);
  const refContent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (refContent && refContent.current) {
      refContent.current.scrollTo(0, 0);
    }

    setIsProfileVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (isNone(info)) {
      getUser()
        .then((info: Athlete) => {
          dispatch(setUserInfo(info));
          dispatch(
            setUserActivitiesRange([new Date(info.created_at), new Date()])
          );

          pipe(
            fromNullable(read()),
            fold(
              () => {},
              ({ id, data }) =>
                id === info.id ? dispatch(setStats(data)) : clear()
            )
          );
        })
        .catch(err => {
          dispatch(showSnackbar('error', err.message));

          cookie.remove('token');
          history.push('/');
        });
    }
  }, []); // eslint-disable-line

  return (
    <div className={s.root}>
      {pipe(
        info,
        fold(
          () => (
            <div className={s.loader}>
              <div className={s.loaderText}>
                <Typography variant="h6" component="span" align="center">
                  Please wait...
                </Typography>
              </div>
              <CircularProgress />
            </div>
          ),
          r => (
            <div className={s.page}>
              <div
                ref={refBar}
                className={`${s.bar} ${isProfileVisible ? s.barMoved : ''}`}
              >
                <img
                  className={s.stravaImage}
                  src="/strava-powered.png"
                  alt="Powered by strava"
                />
                <IconButton
                  color="primary"
                  aria-label="menu"
                  component="span"
                  onClick={() => setIsProfileVisible(!isProfileVisible)}
                >
                  {isProfileVisible ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
              </div>
              <main ref={refContent} className={s.content}>
                <Switch>
                  <Route exact path={match.path}>
                    <Generate info={r} />
                  </Route>
                  <Route path={`${match.path}/stats`} component={Stats} />
                  <Route path="*" component={NotFound} />
                </Switch>
              </main>
              <aside
                className={`${s.profile} ${
                  isProfileVisible ? s.profileVisible : ''
                }`}
              >
                <Profile />
              </aside>
              <div className={s.overlay}>
                <Backdrop
                  open={isProfileVisible}
                  onClick={() => setIsProfileVisible(false)}
                />
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};

export default withRouter(Main);
