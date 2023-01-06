import { Store } from 'pullstate';

const defaultUIState = {
  showNav: false,
  showMenu: [],
  registrationPopup: false,
  user: null,
  loading: true,
  page: 'home',
  organisations: [],
  administration: [],
  selectedAdministration: [null],
  reloadData: true,
  editedRow: {},
  activityLog: [],
  advanceSearchValue: [],
  administrationByAccess: [],
  rowHovered: null,
  historyChart: {},
  loadedFormId: null,
  boundsAlignToRight: null,
  webformLogin: {
    submitter: null,
    isLogin: false,
    formValue: {},
    complete: true,
  },
};

export const UIState = new Store(defaultUIState);
