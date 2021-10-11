import { Store } from "pullstate";

const defaultUIState = {
  showNav: false,
  showMenu: [],
};

export const UIState = new Store(defaultUIState);
