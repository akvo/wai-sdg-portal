import React, { useEffect, useState } from "react";
import { Layout, Divider, notification } from "antd";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Content from "./components/Content";
import { UIState } from "./state/ui";
import api from "./util/api";
import { useAuth0 } from "@auth0/auth0-react";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import "./App.scss";

const history = createBrowserHistory();

function App() {
  const {
    isAuthenticated,
    loginWithPopup,
    logout,
    user,
    getIdTokenClaims,
  } = useAuth0();
  const [token, setToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      if (isAuthenticated) {
        const response = await getIdTokenClaims();
        if (response) {
          api.setToken(response.__raw);
          setToken(response.__raw);
        }
        api
          .get("/user/me")
          .then(({ data }) => {
            const { active, access, role } = data || {};
            UIState.update((u) => {
              u.user = { ...user, ...data };
            });
          })
          .catch((e) => {
            switch (e.response?.status) {
              case 404:
                break;
              case 401:
                notification.error({
                  message: e.response?.data?.detail,
                });
                break;
              default:
            }
          });
      } else {
        api.setToken(null);
        setTimeout(() => {
          setLoading(false);
          UIState.update((c) => {
            c.loading = false;
          });
        }, 1000);
      }
    })();
  }, [getIdTokenClaims, isAuthenticated, loginWithPopup, user]);

  return (
    <Router history={history}>
      <div className="App">
        <Navigation
          loginWithPopup={loginWithPopup}
          isAuthenticated={isAuthenticated}
          logout={logout}
        />
        <Layout theme="light">
          <Layout.Header>
            <Header />
          </Layout.Header>
          <Layout.Content>
            <Content />
          </Layout.Content>
          <Layout.Footer>
            <Footer />
          </Layout.Footer>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
