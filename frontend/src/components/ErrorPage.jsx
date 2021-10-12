import React from "react";
import { Result, Button } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";

const ErrorIcon = () => <InfoCircleFilled style={{ color: "#ff4d4f" }} />;

const RefreshButton = () => {
  return (
    <Button type="default" onClick={() => window.location.reload()} danger>
      Try Again
    </Button>
  );
};

const pageProps = (status) => {
  switch (status) {
    case 404:
      return {
        status: "warning",
        title: "Page not found",
        subTitle: "Sorry, we couldn't find that page",
      };
    default:
      return {
        status: "info",
        icon: <ErrorIcon />,
        title: "Oops, Something went wrong",
        subTitle:
          "Try to refresh this page or feel free to contact us if the problem persist.",
        extra: <RefreshButton />,
      };
  }
};

const ErrorPage = ({ status }) => {
  const props = pageProps(status);
  return <Result {...props} />;
};

export default ErrorPage;
