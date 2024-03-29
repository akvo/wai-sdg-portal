import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ProtectedContent from './ProtectedContent';

import Home from '../pages/home/Home';
import Doc from '../pages/doc/Doc';
import ErrorPage from './ErrorPage';
import Admin from '../pages/admin/Admin';
import Forms from '../pages/Forms';
import Main from '../pages/main/Main';
import WebformStandalone from '../pages/webform/WebformStandalone';

const Content = () => {
  return (
    <Switch>
      <Route
        exact
        path="/"
      >
        <Home />
      </Route>
      <Route
        exact
        path="/login"
      >
        <Home />
      </Route>
      <ProtectedContent
        path="/data/:page"
        component={Main}
      />
      <ProtectedContent
        path="/admin/:page"
        component={Admin}
      />
      <ProtectedContent
        exact
        path="/api-docs"
        component={Doc}
      />
      <Route
        path="/form/:title/:id"
        component={Forms}
      />
      <Route
        path="/webform"
        component={WebformStandalone}
      />
      <Route
        exact
        path="/not-found"
      >
        <ErrorPage status={404} />
      </Route>
      <Route
        exact
        path="/not-authorized"
      >
        <ErrorPage status={401} />
      </Route>
      <Route
        exact
        path="/error"
      >
        <ErrorPage />
      </Route>
      <Route
        component={(props) => (
          <ErrorPage
            {...props}
            status={404}
          />
        )}
      />
    </Switch>
  );
};

export default Content;
