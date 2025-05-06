import * as React from "react";
import Typography from "@material-ui/core/Typography";
import ErrorIcon from '@material-ui/icons/Error';
import Grid from '@material-ui/core/Grid';

interface ErrorProps {
  error: string | JSX.Element;
  id?: string;
}

const ErrorMessage: React.SFC<ErrorProps> = (props) => {
  const { error, id } = props;
  return error ? (
    <Grid
      container
      direction="row"
      alignItems="center"
    >
      <ErrorIcon fontSize="small" color="error"/>
      <Typography id={id} color="error">{error}</Typography>
    </Grid>
  ) : null;
}

export default ErrorMessage;