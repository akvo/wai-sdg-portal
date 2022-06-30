import React, { useEffect, useState } from "react";
import { Layout, notification, Image } from "antd";
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
  const [tourStep, setTourStep] = useState(0);

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
      content: ({ goTo }) => (
        <div>
          <h2>Welcome to this portal.</h2>
          <p>
            <b>Next:</b> Take a look at the Logo. If you are logged in,
            <button type="primary" onClick={() => goTo(6)}>
              Go to Step 6
            </button>
          </p>
        </div>
      ),
    },
    {
      selector: `.header-logo`,
      content: () => (
        <div>
          <h2>Logo</h2>
          <p>Now, you look around before you log in please.</p>
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
            <b>Next:</b> see the Activity logs.
          </p>
        </div>
      ),
    },
    {
      selector: `.log-in`,
      content: () => (
        <div>
          <h2>Log in to see more features</h2>
          <p>Please, click ths button to Log in.</p>
        </div>
      ),
    },
    {
      selector: `#root`,
      content: () => (
        <div>
          <h2>You are logged in.</h2>
          <p>
            <b>Next:</b> "Activities log".
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
    },
    {
      selector: `.menu-outlined`,
      content: () => (
        <div>
          <h2>Click to see all data all data points</h2>
          <p>
            Then click the <b>Water points</b>.
          </p>
        </div>
      ),
    },
    {
      selector: `.menu-outlined`,
      content: () => (
        <div>
          <p>Once you click, a sidebar is open.</p>
          <h3>Now, take a look at the sidebar.</h3>
        </div>
      ),
      action: (node) => {
        node.click();
      },
    },
    {
      selector: `.ant-drawer-content`,
      content: () => (
        <div>
          <h2>See all data points</h2>
          <p>
            Then click the <b>Water Points</b>.
          </p>
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
      selector: `.ant-space-item:nth-of-type(1) .ant-select-selector`,
      content: () => (
        <div>
          <h2>Select a data point</h2>
          <p>You can select on of the data entry bellow.</p>
        </div>
      ),
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
            You need to <b>click</b> this button to see an input
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
          <p>You have to select a district to the JMP charts bellow.</p>
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
          <p>You need to select a district to see the JMP charts</p>
        </div>
      ),
    },
    {
      selector: `.chart-container`,
      content: () => (
        <div>
          <h2>JMP chart</h2>
          <p>You will see something like this here.</p>
          <Image src="/assets/jmp.png" preview={false} />
        </div>
      ),
    },
    {
      selector: `.data`,
      content: () => (
        <div>
          <h2>Data table</h2>
          <p>Click on the Data tab</p>
        </div>
      ),
    },
    {
      selector: `.data`,
      content: () => (
        <div>
          <h2>Data table</h2>
          <p>After you select a district, you will see a table.</p>
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
          <h2>View the Data Table</h2>
          <p>This is what you will see once you select the data tab</p>
          <Image src="/assets/data.png" preview={false} />
        </div>
      ),
    },
    {
      selector: `.data-info .main-table-container .ant-table`,
      content: () => (
        <div>
          <h2>That is yet</h2>
          <p>Now you can log out if you want to.</p>
        </div>
      ),
    },
    {
      selector: `.logout-btn`,
      content: () => (
        <div>
          <h2>
            Please, close the Tour and click this to log out if you would like.
          </h2>
          <p>Thank you!</p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      setTourStep(6);
    }
  }, [tourStep, isAuthenticated, user]);

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
        getCurrentStep={setTourStep}
      />
    </Router>
  );
}

export default App;
