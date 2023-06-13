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
  activityData: {
    current: 1,
    data: [],
    total: 0,
    total_page: 0,
    active: false,
    loading: false,
  },
  advanceSearchValue: [],
  administrationByAccess: [],
  rowHovered: null,
  historyChart: {},
  loadedFormId: null,
  boundsAlignToRight: null,
};

export const UIState = new Store(defaultUIState);
