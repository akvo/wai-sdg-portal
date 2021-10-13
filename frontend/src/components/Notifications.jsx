export const NonActiveUserMessage = ({ user }) => {
  return (
    <p>
      {user?.email_verified === false && (
        <b>
          Click on the link we sent in your email to verify your email address.
        </b>
      )}
      We will review your sign-up request
      {user?.email_verified === false &&
        " as soon as you verify your email address"}
      . Please, allow for 1 business day.
    </p>
  );
};
