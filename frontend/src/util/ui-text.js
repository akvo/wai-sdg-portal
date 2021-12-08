const header = {
  noActivity: "No Activity",
  activityLog: "Activity Log",
  recentActivityLog: "Recent Activity Log",
  attachment: "Attachment",
};

const footer = {
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  developer: "Developer",
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

const uiText = {
  header,
  footer,
  chart,
  confirmationModal,
};

export default uiText;
