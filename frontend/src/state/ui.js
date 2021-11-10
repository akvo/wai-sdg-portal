import { Store } from "pullstate";

const defaultUIState = {
  showNav: false,
  showMenu: [],
  registrationPopup: false,
  user: null,
  loading: true,
  page: "home",
  organisations: [],
  administration: [],
  selectedAdministration: [null],
  reloadData: true,
  editedRow: {},
  jobStatus: [],
  advanceSearchValue: [],
  administrationByAccess: [],
};

export const UIState = new Store(defaultUIState);
