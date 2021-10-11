import React from "react";
import { BrowserRouter as Switch, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import Doc from "../pages/doc/Doc";

const Content = () => {
  //! Route here
  return (
    <>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/documentation">
        <Doc />
      </Route>
    </>
  );
};

export default Content;
