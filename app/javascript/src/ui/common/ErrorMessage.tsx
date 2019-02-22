import * as React from "react";
import Typography from "@material-ui/core/Typography";

interface ErrorProps {
  error: string | JSX.Element;
  id?: string;
}

const ErrorMessage: React.SFC<ErrorProps> = (props) => {
  const { error, id } = props;
  return (
    <Typography id={id} color="error">{error}</Typography>
  )
}

export default ErrorMessage;