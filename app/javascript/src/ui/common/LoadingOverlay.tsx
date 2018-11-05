import * as React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

interface LoadingProps {
  id: string;
  contained?: boolean;
}
const LoadingOverlay: React.SFC<LoadingProps> = (props) => {
  const id = `${props.id}-loading`
  return (
    <div className="loading-overlay" style={props.contained && {position: "relative"}}>
      <div className="spinner-container">
        <CircularProgress id={id}/>
      </div>
    </div>
  )
}

export default LoadingOverlay;