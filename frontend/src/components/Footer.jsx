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
  // TODO:: Move this content to cofig
  return (
    <>
      <Row align="space-between" className="footer-start">
        <FooterContent
          title="Data"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac consectetur diam. Pellentesque lacinia, erat ac efficitur molestie, sapien odio efficitur purus, non ornare sem massa euismod metus."
        />
        <FooterContent
          title="Monitoring"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac consectetur diam. Pellentesque lacinia, erat ac efficitur molestie, sapien odio efficitur purus, non ornare sem massa euismod metus."
        />
        <FooterContent
          title="How we work"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac consectetur diam. Pellentesque lacinia, erat ac efficitur molestie, sapien odio efficitur purus, non ornare sem massa euismod metus."
        />
      </Row>
      <FooterEnd />
    </>
  );
};

export default Footer;
