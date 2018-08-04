import * as React from "react";

interface ErrorProps {
  error: string;
}

const ErrorMessage: React.SFC<ErrorProps> = (props) => {
  const { error } = props;
  return (
    <div className="error-message">{error}</div>
  )
}

export default ErrorMessage;