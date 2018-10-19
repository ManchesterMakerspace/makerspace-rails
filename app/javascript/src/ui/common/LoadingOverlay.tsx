import * as React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

interface LoadingProps {
  id: string;
}
const LoadingOverlay: React.SFC<LoadingProps> = (props) => {
  const id = `${props.id}-loading`
  return (
    <div className="loading-overlay">
      <div className="spinner-container">
        <CircularProgress id={id}/>
      </div>
    </div>
  )
}

export default LoadingOverlay;