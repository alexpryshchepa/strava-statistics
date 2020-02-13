import React from 'react';
import MUITableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';

type Props = {
  name: string;
};

const TableRow: React.FC<Props> = ({ children, name }) => (
  <MUITableRow key={name}>
    <TableCell component="th" scope="row">
      {name}
    </TableCell>
    <TableCell align="right">
      <Typography variant="h6" component="span">
        {children}
      </Typography>
    </TableCell>
  </MUITableRow>
);

export default TableRow;
