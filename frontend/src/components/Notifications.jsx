const { notificationText } = window?.i18n;

export const NonActiveUserMessage = ({ user }) => {
  return (
    <p>
      {user?.email_verified === false
        ? notificationText?.registrationVerifyEmailText
        : notificationText?.registrationEmailVerifiedText}
    </p>
  );
};

export const DataUpdateMessage = ({ id }) => {
  return (
    <p>
      {id} {notificationText?.isUpdatedText}
    </p>
  );
};

export const DataDeleteMessage = ({ id }) => {
  return (
    <p>
      {id} {notificationText?.isDeletedText}
    </p>
  );
};
