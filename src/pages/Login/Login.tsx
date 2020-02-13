import React from 'react';
import cookie from 'js-cookie';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { endpoints } from 'api';
import s from './Login.module.scss';

const Login: React.FC = () => {
  return (
    <div className={s.root}>
      <div className={s.title}>
        <Typography variant="h4" component="h4" align="center">
          Login to generate your statistics
        </Typography>
      </div>
      {cookie.get('token') ? (
        <Button variant="outlined" color="secondary" href="/main">
          Already logged in
        </Button>
      ) : (
        <Button variant="contained" color="primary" href={endpoints.login}>
          Login with Strava
        </Button>
      )}
    </div>
  );
};

export default Login;
