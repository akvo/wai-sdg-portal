import { Store } from "pullstate";

const defaultUIState = {
  showNav: false,
  showMenu: [],
  user: null,
  page: "home",
};

export const UIState = new Store(defaultUIState);
