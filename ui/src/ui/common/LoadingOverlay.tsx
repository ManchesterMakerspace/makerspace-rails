import * as React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

interface LoadingProps {
  id?: string;
  contained?: boolean;
}
// TODO: This is weird that it mutates an 'id' prop
const LoadingOverlay: React.SFC<LoadingProps> = (props) => {
  const id = `${props.id}-loading`
  return (
    <div id={id} className="loading-overlay" style={props.contained && {position: "relative"}}>
      <div className="spinner-container">
        <CircularProgress />
      </div>
    </div>
  )
}

export default LoadingOverlay;

export function withLoading<Props, State>(
  WrappedComponent: React.FunctionComponent<Props> | React.ComponentClass<Props, State>,
  loadingId?: string,
) {

  return class extends React.Component<Props & { loading?: boolean }, State> {
    render() {
      return (
        <div style={{ position: "relative" }}>
          {this.props.loading && <LoadingOverlay id={loadingId}/>}
          <WrappedComponent {...this.props} />
        </div>
      ) 
      
    }
  }
}
