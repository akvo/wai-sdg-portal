import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import ProtectedContent from "./ProtectedContent";

import Home from "../pages/home/Home";
import Doc from "../pages/doc/Doc";
import ErrorPage from "./ErrorPage";
import Water from "../pages/water/Water";
import Admin from "../pages/admin/Admin";
import Forms from "../pages/Forms";

const Content = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Home />
      </Route>
      <ProtectedContent exact path="/water" component={Water} />
      <ProtectedContent exact path="/admin" component={Admin} />
      <ProtectedContent exact path="/documentation" component={Doc} />
      <Route path="/form/:title/:id" component={Forms} />

      <Route exact path="/not-found">
        <ErrorPage status={404} />
      </Route>
      <Route exact path="/not-authorized">
        <ErrorPage status={401} />
      </Route>
      <Route exact path="/error">
        <ErrorPage />
      </Route>
      <Route component={(props) => <ErrorPage {...props} status={404} />} />
    </Switch>
  );
};

export default Content;
