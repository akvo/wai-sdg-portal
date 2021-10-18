import { trim } from "lodash";

export const isAuthCookie = () => {
  return document.cookie
    .split(";")
    .map((item) => trim(item))
    .find((x) => x.includes("_legacy_auth0."))
    ?.includes(".is.authenticated=true");
};
