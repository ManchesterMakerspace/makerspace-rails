import * as React from "react";
import { Typography } from "@material-ui/core";

interface ErrorProps {
  error: string;
}

const ErrorMessage: React.SFC<ErrorProps> = (props) => {
  const { error } = props;
  return (
    <Typography color="error">{error}</Typography>
  )
}

export default ErrorMessage;