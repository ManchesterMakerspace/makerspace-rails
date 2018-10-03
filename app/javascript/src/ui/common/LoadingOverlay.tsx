import * as React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

interface LoadingProps {
  id: string;
}
const LoadingOverlay: React.SFC<LoadingProps> = (props) => {
  const id = `${props.id}-loading-overlay`
  return (
    <div className="loading-overlay" id={id}>
      <div className="spinner-container">
        <CircularProgress/>
      </div>
    </div>
  )
}

export default LoadingOverlay;