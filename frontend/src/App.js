import React, { useEffect } from "react";
import { Layout, notification } from "antd";
import { NonActiveUserMessage } from "./components/Notifications";
import Navigation from "./components/Navigation";
import RegistrationPopup from "./components/RegistrationPopup";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Content from "./components/Content";
import { UIState } from "./state/ui";
import api from "./util/api";
import { useAuth0 } from "@auth0/auth0-react";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
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
  const { registrationPopup } = UIState.useState((s) => s);

  useEffect(() => {
    (async function () {
      if (isAuthenticated) {
        const response = await getIdTokenClaims();
        if (response) {
          api.setToken(response.__raw);
        }
        api
          .get("user/me")
          .then(({ data }) => {
            const { active } = data || {};
            UIState.update((u) => {
              u.user = { ...user, ...data };
            });
            if (!active) {
              notification.warning({
                message: <NonActiveUserMessage user={user} />,
              });
            }
            if (active) {
              api.get("administration").then((a) => {
                let administrationByAccess = a.data;
                if (user?.role !== "admin" && !isEmpty(data?.access)) {
                  administrationByAccess = a.data.filter(
                    (adm) =>
                      data?.access.includes(adm.id) ||
                      data?.access.includes(adm.parent)
                  );
                }

                UIState.update((u) => {
                  u.administration = a.data;
                  u.administrationByAccess = administrationByAccess;
                });
              });
            }
          })
          .catch((e) => {
            switch (e.response?.status) {
              case 404:
                UIState.update((u) => {
                  u.registrationPopup = true;
                });
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
          UIState.update((c) => {
            c.loading = false;
          });
          if (window.location.pathname === "/login") {
            loginWithPopup();
            history.push("/");
          }
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
            <Header
              loginWithPopup={loginWithPopup}
              isAuthenticated={isAuthenticated}
              logout={logout}
            />
          </Layout.Header>
          <Layout.Content>
            <Content />
          </Layout.Content>
          <Layout.Footer>
            <Footer />
          </Layout.Footer>
        </Layout>
      </div>
      {registrationPopup && (
        <RegistrationPopup
          user={user}
          logout={logout}
          loginWithPopup={loginWithPopup}
        />
      )}
    </Router>
  );
}

export default App;
