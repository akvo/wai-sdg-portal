import { Store } from "pullstate";

const defaultUIState = {
  showNav: false,
  showMenu: [],
  registrationPopup: false,
  user: null,
  loading: true,
  page: "home",
  organisations: [],
};

export const UIState = new Store(defaultUIState);
