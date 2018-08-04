import * as React from "react";

interface ErrorProps {
  touched: boolean;
  error: string;
}

const errorSpanStyle = {
  color: "red",
  height: "8px",
  fontSize: "0.8em",
  lineHeight: "1em",
  marginTop: "0.2em",
}

const ErrorMessage: React.SFC<ErrorProps> = (props) => {
  return (
    <div style={errorSpanStyle}>{props.touched && props.error}</div>
  )
}

export default ErrorMessage;