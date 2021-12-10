const { notificationText } = window?.i18n;

export const NonActiveUserMessage = ({ user }) => {
  return (
    <p>
      {user?.email_verified === false
        ? notificationText?.registrationVerifyEmailText?.map((x, xi) =>
            xi === 0 ? <b key={`reg-${xi}`}>{`${x} `}</b> : x
          )
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
