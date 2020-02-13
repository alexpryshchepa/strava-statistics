require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = {
  PORT: process.env.PORT || 8080,
  CLIENT_URI:
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
};

const app = express();
const auth = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

auth.get('/callback', function(req, res) {
  fetch(
    `https://www.strava.com/oauth/token?client_id=${process.env.REACT_APP_STRAVA_CLIENT_ID}&client_secret=${process.env.REACT_APP_STRAVA_CLIENT_SECRET}&code=${req.query.code}&grant_type=authorization_code`,
    { method: 'POST' }
  )
    .then(response => {
      if (response.ok) {
        return response.json();
      }

      return new Error('');
    })
    .then(data => {
      let token;
      let maxAge;

      try {
        const { access_token, expires_in } = data;

        token = access_token;
        maxAge = expires_in * 1000;
      } catch {
        return new Error('');
      }

      return res
        .cookie('token', token, { maxAge })
        .redirect(`${config.CLIENT_URI}/main`);
    })
    .catch(() => res.redirect(`${config.CLIENT_URI}/error`));
});

app.use('/auth', auth);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(config.PORT, function() {
  console.log(`Server listening on port ${config.PORT}`);
});
