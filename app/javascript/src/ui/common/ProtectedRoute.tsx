import * as React from "react";
import { Route, Redirect, RouteProps } from "react-router";

interface PrivateRouteProps extends RouteProps {
  auth: boolean
}

const PrivateRoute: React.SFC<PrivateRouteProps> = ({ component: Component, auth, ...rest }) => (
  <Route {...rest} render={(props) => (
    auth
      ? <Component {...props} />
      : <Redirect to='/' />
  )} />
);

export default PrivateRoute;