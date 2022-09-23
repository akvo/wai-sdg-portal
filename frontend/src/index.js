import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client';
import 'antd/dist/antd.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <Auth0Provider
    domain="wai-ethiopia.eu.auth0.com"
    clientId="OlqShNF3knpLpwX7iPLUHFTr9BlrrkHF"
    redirectUri={window.location.origin}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
);

reportWebVitals();
