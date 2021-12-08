import React from "react";
import { Result, Button } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import uiText from "../util/i18n";

const ErrorIcon = () => <InfoCircleFilled style={{ color: "#ff4d4f" }} />;

const RefreshButton = () => {
  const { buttonText } = uiText;
  return (
    <Button type="default" onClick={() => window.location.reload()} danger>
      {buttonText?.btnTryAgain}
    </Button>
  );
};

const pageProps = (status) => {
  const { notFoundText, notAuthorizedText, errorText } = uiText?.errorPageText;
  switch (status) {
    case 404:
      return {
        status: "warning",
        title: notFoundText?.title,
        subTitle: notFoundText?.subTitle,
      };
    case 401:
      return {
        status: "warning",
        title: notAuthorizedText?.title,
        subTitle: notAuthorizedText?.subTitle,
      };
    default:
      return {
        status: "info",
        icon: <ErrorIcon />,
        title: errorText?.title,
        subTitle: errorText?.subTitle,
        extra: <RefreshButton />,
      };
  }
};

const ErrorPage = ({ status }) => {
  const props = pageProps(status);
  return <Result {...props} />;
};

export default ErrorPage;
