import uiText from "../util/i18n";

const { notificationText } = uiText;

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
