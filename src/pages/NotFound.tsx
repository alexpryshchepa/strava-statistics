import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div>
    <Typography variant="h4" component="h4">
      Page not found!
    </Typography>
    <Link to="/main">Return to main page</Link>
  </div>
);

export default NotFound;
