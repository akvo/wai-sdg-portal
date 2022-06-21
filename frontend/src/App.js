import React, { useEffect, useState } from "react";
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
import Tour from "reactour";

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
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);

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

                const selectedAdministration =
                  user?.role === "admin" || data?.access?.length > 1
                    ? [null]
                    : [null, data?.access?.[0]];
                UIState.update((u) => {
                  u.administration = a.data;
                  u.administrationByAccess = administrationByAccess;
                  u.selectedAdministration = selectedAdministration;
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

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const toggleShowMore = () => {
    setIsShowingMore(!isShowingMore);
  };

  const tourConfig = [
    {
      selector: `#root`,
      content: () => (
        <div>
          <h2>Welcome to this portal.</h2>
          <p>
            Now look around before <b>logging in.</b>
          </p>
        </div>
      ),
    },
    {
      selector: `.dataset-container`,
      content: () => (
        <div>
          <h2>A list of dataset in this portal.</h2>
          <p>
            <b>Next:</b> see Caraousel Overview.
          </p>
        </div>
      ),
    },
    {
      selector: `.overview-item-row`,
      content: () => (
        <div>
          <h2>Caraouser</h2>
          <p>
            <b>Next:</b> see Caraousel Overview.
          </p>
        </div>
      ),
    },
    {
      selector: `.log-in`,
      content: () => (
        <div>
          <h2>Log in to see more features</h2>
          <p>
            <b>Next:</b> Click the button to log in.
          </p>
        </div>
      ),
    },
    {
      selector: `.App`,
      content: () => (
        <div>
          <h2>You are logged in.</h2>
          <p>
            <b>Next:</b> Go to activity log button.
          </p>
        </div>
      ),
    },
    {
      selector: `.activity-log`,
      content: () => (
        <div>
          <h2>See log activities</h2>
          <p>
            <b>Next:</b> Go to the menu button.
          </p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.menu-outlined`,
      content: () => (
        <div>
          <h2>Click to see all data</h2>
          <p>
            Then click the <b>Household</b>.
          </p>
        </div>
      ),
    },
    {
      selector: `.menu-outlined`,
      content: () => (
        <div>
          <p>Once you click, a sidebar is open.</p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.ant-drawer-wrapper-body`,
      content: () => (
        <div>
          <h2>See all data</h2>
          <p>
            Then click the <b>Water Points</b>.
          </p>
        </div>
      ),
    },
    {
      selector: `.Water`,
      content: () => (
        <div>
          <h2>See the Water points</h2>
          <p>
            Then click the <b>Water Points</b>.
          </p>
        </div>
      ),
      action: (node) => {
        node.click();
        history.push("/data/water");
      },
    },
    {
      selector: `.App`,
      content: () => (
        <div>
          <h2>Water points</h2>
          <p>
            Then click the <b>Water Points</b>.
          </p>
        </div>
      ),
    },
    {
      selector: `.ant-space-item:nth-of-type(1) .ant-select-selector`,
      content: () => (
        <div>
          <h2>Select a data point</h2>
          <p>You can select on of the data entry bellow.</p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.ant-space-item:nth-of-type(2) .ant-select-selector`,
      content: () => (
        <div>
          <h2>Select a district</h2>
        </div>
      ),
    },
    {
      selector: `.remove-filter-button`,
      content: () => (
        <div>
          <h2>Reset filter</h2>
          <p>Once you click this, you no longer filter.</p>
        </div>
      ),
    },
    {
      selector: `.advance-search-btn`,
      content: () => (
        <div>
          <h2>Click this to open advance search</h2>
          <p>
            Now, you need to <b>click</b> the button
          </p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.ant-collapse-content-box .ant-select-show-search`,
      content: () => (
        <div>
          <h2>Search by organisation</h2>
          <p>
            Now, <b>you can select an organisation</b>
          </p>
        </div>
      ),
    },
    {
      selector: `.data-container .leaflet-container`,
      content: () => (
        <div>
          <h2>Leaflet container for the map</h2>
          <p>
            <b>Next</b> Select a marker
          </p>
        </div>
      ),
    },
    {
      selector: `.data-container .marker-dropdown-container`,
      content: () => (
        <div>
          <h2>Select a marker</h2>
          <p>
            <b>Next</b> See the existing data
          </p>
        </div>
      ),
    },
    {
      selector: `.data-container .ant-table`,
      content: () => (
        <div>
          <h2>The data on a table</h2>
        </div>
      ),
    },
    {
      selector: `.visual-card-wrapper .ant-card-head`,
      content: () => (
        <div>
          <h2>Chart header</h2>
        </div>
      ),
    },
    {
      selector: `.ant-card-body .ant-select-selector`,
      content: () => (
        <div>
          <h2>Select a type of Chart</h2>
          <p>You need to select a type if you to see another chart.</p>
        </div>
      ),
    },
    {
      selector: `.echarts-for-react `,
      content: () => (
        <div>
          <h2>Chart</h2>
          <p>
            Now, let see <b>Household</b>
          </p>
        </div>
      ),
    },
    {
      selector: `.App `,
      content: () => (
        <div>
          <h2>Next</h2>
          <p>
            You have seen most of the features. If you go to another data
            points, all is pretty simmilar. Now, let's take to <b>Household</b>{" "}
            for more features.
          </p>
        </div>
      ),
    },
    {
      selector: `.App `,
      content: () => (
        <div>
          <h2>Next</h2>
          <p>
            You have seen most of the features. If you go to another data
            points, all is pretty simmilar. Now, let's take to <b>Household</b>{" "}
            for more features.
          </p>
        </div>
      ),
    },
    {
      selector: `.menu-outlined`,
      content: () => (
        <div>
          <p>Once you click, a sidebar is open.</p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.ant-drawer-wrapper-body`,
      content: () => (
        <div>
          <h2>See all data</h2>
          <p>
            Then click the <b>Water Points</b>.
          </p>
        </div>
      ),
    },
    {
      selector: `.CLTS`,
      content: () => (
        <div>
          <h2>CLTS</h2>
          <p>You can click it</p>
        </div>
      ),
    },
    {
      selector: `.Households`,
      content: () => (
        <div>
          <h2>Households</h2>
          <p>You can click it</p>
        </div>
      ),
    },
    {
      selector: `.Households`,
      content: () => (
        <div>
          <h2>Households</h2>
          <p>You can click it</p>
        </div>
      ),
      action: (node) => {
        node.click();
        history.push("/data/households");
      },
    },
    {
      selector: `.App`,
      content: () => (
        <div>
          <h2>Households</h2>
          <p>Now, go to the tabs to more details.</p>
        </div>
      ),
    },
    {
      selector: `.data-tabs`,
      content: () => (
        <div>
          <h2>Tabs</h2>
          <p>Before clicking on one of the buttons, select a district.</p>
        </div>
      ),
    },
    {
      selector: `.JMP`,
      content: () => (
        <div>
          <h2>JMP</h2>
          <p>Click on the JMP tab</p>
        </div>
      ),
    },
    {
      selector: `.JMP`,
      content: () => (
        <div>
          <h2>JMP</h2>
          <p>Click now</p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.chart-container`,
      content: () => (
        <div>
          <h2>JMP chart</h2>
          <p>You need to select a district to see the JMP charts</p>
        </div>
      ),
    },
    {
      selector: `.data`,
      content: () => (
        <div>
          <h2>Data</h2>
          <p>Click on it</p>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.main-table-container`,
      content: () => (
        <div>
          <h2>Table container</h2>
        </div>
      ),
    },
    {
      selector: `#root`,
      content: () => (
        <div>
          <h2>That's the end of your tour. Enjoy your journey</h2>
        </div>
      ),
    },
  ];

  return (
    <Router history={history}>
      <div className="App">
        <Navigation />
        <Layout theme="light">
          <Layout.Header>
            <Header
              loginWithPopup={loginWithPopup}
              isAuthenticated={isAuthenticated}
              logout={logout}
              openTour={() => setIsTourOpen(true)}
              isShowingMore={isShowingMore}
              toggleShowMore={toggleShowMore}
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
      <Tour
        isOpen={isTourOpen}
        onRequestClose={closeTour}
        steps={tourConfig}
        rounded={5}
        maskClassName="mask"
        accentColor={"#5cb7b7"}
      />
    </Router>
  );
}

export default App;
