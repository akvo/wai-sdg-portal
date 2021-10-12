import { trim } from "lodash";

export const isAuthCookie = () => {
  return document.cookie
    .split(";")
    .map((item) => trim(item))
    .includes("_legacy_auth0.is.authenticated=true");
};
