import React from "react";
import { Route, Redirect } from "react-router-dom";

import { UIState } from "../state/ui";
import { isAuthCookie } from "../util/auth";

const ProtectedContent = ({ component: Component, ...rest }) => {
  const { user } = UIState.currentState;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (user || isAuthCookie()) {
          return <Component {...rest} {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
      }}
    />
  );
};

export default ProtectedContent;
