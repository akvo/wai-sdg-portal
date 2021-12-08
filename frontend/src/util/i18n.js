const header = {
  noActivityText: "No Activity",
  activityLogText: "Activity Log",
  recentActivityLogText: "Recent Activity Log",
  attachmentText: "Attachment",
};

const navigation = {
  adminText: "Admin",
  aboutText: "About",
  signupText: "Signup",
  logoutText: "Logout",
  loginText: "Login",
};

const footer = {
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  developer: "Developer",
};

const home = {
  jumbotronText:
    "This portal is used by ##administration## to see the relative WASH vulnerability of communities and institutions, and track the status of water and sanitation infrastructure",
  datasetSectionTitle: "Datasets in this Portal",
  overviewSectionTitle: "Overview of",
  exploreText: "Explore",
  exploreDataText: "EXPLORE THE DATA",
  readMoreText: "Read more",
};

const chartText = {
  tbColCategory: "Category",
  tbColCount: "Count",
  noDataText: "No Data",
  highText: "High",
  lowText: "Low",
  tableViewTitle: "Table View",
  btnBack: "Back",
  btnRefresh: "Refresh",
  btnSaveImage: "save image",
};

const confirmationModalText = {
  submitText: {
    title: "Submit Entry?",
    subTitle: "Are you sure you want to submit this entry?",
    btnOkText: "Yes, Submit This Entry",
  },
  deleteText: {
    title: "Delete Entry?",
    subTitle:
      "This changes are irreversible, this will permanently delete the data and it's history as well.",
    btnOkText: "Yes, Delete This Entry",
    inputTitle: (
      <>
        Please type <b>DELETE</b> to confirm
      </>
    ),
    checkboxText: "I understand the consequences.",
  },
  saveText: {
    title: "Save Entry?",
    subTitle: "You can come back at any time to complete and submit",
    btnOkText: "Yes, Save This Entry",
  },
};

const adminText = {
  welcomeText: "Welcome Admin",
  tabManageDataText: "Manage Data",
  tabExportText: "Exports",
  tabDataUploadText: "Data Upload",
  tabManageUserText: "Manage Users",
  modalEditUserTitle: "Edit User",
  modalApproveUserTitle: "Approve User",
  checkboxShowPendingUserText: "Show Pending Users",
  dataUploadTemplateDownloadSectionText:
    "If you do not already have a template file, please download it",
  dataUploadSectionText: "Upload your data",
  exportFilterListText: "Filters",
  exportNoneTagListText: "None",
  exportPopoverAdministrationText: "Administration Level",
  exportEndOfListText: "End of the list",
  lastSubmittedAtText: "Last submitted",
  lastSubmittedByText: "by",
};

const mainText = {
  createdText: "Created",
  updatedText: "Updated",
};

const tableText = {
  manageUserTableText: {
    colName: "Name",
    colEmail: "Email",
    colOrg: "Organisation",
    colRole: "Role",
  },
  manageDataTableText: {
    colName: "Entry",
    colAdministration: "Region",
    colCreatedBy: "Submitter",
    colCreated: "Last Updated",
    colAction: "Action",
  },
  mainTableChildText: {
    colValue: "History",
    colDate: "Updated at",
    colUser: "Updated by",
  },
};

const buttonText = {
  btnEdit: "Edit",
  btnApprove: "Approve",
  btnCancel: "Cancel",
  btnInformUser: "Inform User",
  btnConfirmChanges: "Confirm Changes",
  btnDownload: "Download",
  btnDownloading: "Downloading",
  btnLoadMore: "Load More",
  btnGenerating: "Generating",
  btnDelete: "Delete",
  btnExportFilterData: "Export Filtered Data",
  btnSaveChanges: "Save Changes",
  btnDeleteSelected: "Delete Selected",
  btnAddNew: "Add New",
  btnSaveDraft: "Save Draft",
  btnClose: "Close",
  btnResetAll: "Reset All",
  btnSaveEdit: "Save Edit",
};

const formText = {
  labelName: "Name",
  labelEmail: "Email",
  labelRole: "Role",
  labelAccess: "Access",
  labelOrg: "Organisation",
  optionRoleAdmin: "Admin",
  optionRoleEditor: "Editor",
  optionRoleUser: "User",
  inputFilePlaceholder: "Click or drag file to this area to upload",
  supportExcelFileText: "Supported filetypes: .xls and .xlsx.",
};

const notificationText = {
  emailSentText: "Email has been sent",
  updateSuccessText: "Update process has been applied",
  userApprovedText: "User approved",
  errorText: "Something wen't wrong",
  statusWaitingValidationText: "Waiting for validation",
  statusFailedValidationText: "Failed",
  statusSuccessValidationText: "Submitted",
  loadingText: "Loading...",
  doneText: "Done!",
  failedText: "Failed",
  bulkDeleteSuccessText: "Bulk delete success",
  dataExportCreatedText: "Data Export Created",
  formPostDataSuccessText: "Data ID: ##content## Saved",
};

const uiText = {
  header,
  navigation,
  footer,
  home,
  adminText,
  chartText,
  confirmationModalText,
  notificationText,
  tableText,
  buttonText,
  formText,
  mainText,
};

export default uiText;
