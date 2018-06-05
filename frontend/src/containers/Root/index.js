import React from "react";
import { Switch, Route } from "react-router";
import App from "Containers/App";
import Home from "Containers/Home";
import Admin from "Containers/Admin";
import Leads from "Containers/Leads";
import Users from "Containers/Users";

const Root = () => (
  <App>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/leads" component={Leads} />
      <Route path="/users" component={Users} />
    </Switch>
  </App>
);

export default Root;