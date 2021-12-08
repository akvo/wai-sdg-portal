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

const chart = {
  tbColCategory: "Category",
  tbColCount: "Count",
};

const confirmationModal = {
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

const admin = {
  welcomeText: "Welcome Admin",
  tabManageDataText: "Manage Data",
  tabExportText: "Exports",
  tabDataUploadText: "Data Upload",
  tabManageUserText: "Manage Users",
};

const uiText = {
  header,
  navigation,
  footer,
  home,
  admin,
  chart,
  confirmationModal,
};

export default uiText;
