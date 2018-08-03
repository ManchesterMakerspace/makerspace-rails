import { Switch, Route } from "react-router"; 
import Home from "../ui/page/Home";
import Header from "../ui/page/Header";
import NotFound from "../ui/page/NotFound";

import * as React from "react";

const Routes: React.SFC<{}> = () => {
  return (
    <div>
      <Header/>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default Routes;