import React from "react";
import { Row, Col } from "antd";
import { FacebookFilled, TwitterOutlined } from "@ant-design/icons";
import { UIState } from "../state/ui";
import { Link } from "react-router-dom";
import uiText from "../util/i18n";

const FooterContent = ({ title, text }) => {
  return (
    <Col span={7}>
      <h2>{title}</h2>
      {text}
    </Col>
  );
};

const FooterEnd = () => {
  const { privacyPolicy, termsOfService, developer } = uiText?.footer;
  const { user } = UIState.useState((c) => c);
  const changePage = ({ key }) => {
    UIState.update((s) => {
      s.page = key;
    });
  };
  return (
    <Row className="footer-end" align="space-between">
      <Col span={8} className="start">
        <Link to="/facebook">
          <FacebookFilled />
        </Link>
        <Link to="/twitter">
          <TwitterOutlined />
        </Link>
      </Col>
      <Col span={8} className="middle">
        © 2021
      </Col>
      <Col span={8} className="end">
        {/* <Link to="/privacy-policy">{privacyPolicy}</Link> */}
        {/* <Link to="/tos">{termsOfService}</Link> */}
        {user && (
          <Link to="/documentation" onClick={() => changePage("documentation")}>
            {developer}
          </Link>
        )}
      </Col>
    </Row>
  );
};

const Footer = () => {
  const { footer } = uiText;
  return (
    <>
      <Row align="space-between" className="footer-start">
        <FooterContent title={footer?.dataTitle} text={footer?.dataText} />
        <FooterContent
          title={footer?.monitoringTitle}
          text={footer?.monitoringText}
        />
        <FooterContent title={footer?.workTitle} text={footer?.workText} />
      </Row>
      <FooterEnd />
    </>
  );
};

export default Footer;
