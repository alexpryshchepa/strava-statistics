import React, { useReducer, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AppContextProvider } from './store';
import { hideSnackbar } from './store/actions';
import { reducer } from './store/reducer';
import appState from './store/state';
import PrivateRoute from './auth/PrivateRoute';
import Login from './pages/Login/Login';
import Main from './pages/Main/Main';
import NotFound from './pages/NotFound';
import Error from './pages/Error';
import ScrollToTop from 'components/ScrollToTop';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { gsap } from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, appState);

  const { visible, severity, message } = state.snackbar;

  useEffect(() => {
    gsap.registerPlugin(CSSPlugin);
  }, []) // eslint-disable-line

  return (
    <AppContextProvider value={[state, dispatch]}>
      <Router>
        <ScrollToTop />
        <Switch>
          <Route exact path={['/', '/login']}>
            <Login />
          </Route>
          <PrivateRoute path="/main">
            <Main />
          </PrivateRoute>
          <Route path="/error">
            <Error />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </Router>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={visible}
        autoHideDuration={6000}
        onClose={() => dispatch(hideSnackbar())}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity={severity}
          onClose={() => dispatch(hideSnackbar())}
        >
          {message}
        </Alert>
      </Snackbar>
    </AppContextProvider>
  );
};

export default App;
