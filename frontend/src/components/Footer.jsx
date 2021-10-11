import React from "react";
import { Row, Col } from "antd";
import { FacebookFilled, TwitterOutlined } from "@ant-design/icons";

const FooterContent = ({ title, text }) => {
  return (
    <Col span={7}>
      <h2>{title}</h2>
      {text}
    </Col>
  );
};

const FooterEnd = () => {
  return (
    <Row className="footer-end" align="space-between">
      <Col span={8} className="start">
        <a href="#">
          <FacebookFilled />
        </a>
        <a href="#">
          <TwitterOutlined />
        </a>
      </Col>
      <Col span={8} className="middle">
        © 2021
      </Col>
      <Col span={8} className="end">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </Col>
    </Row>
  );
};

const Footer = () => {
  return (
    <>
      <Row align="space-between" className="footer-start">
        <FooterContent
          title="Data"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac consectetur diam. Pellentesque lacinia, erat ac efficitur molestie, sapien odio efficitur purus, non ornare sem massa euismod metus. Maecenas at dolor tortor. Praesent sit amet mauris augue. Curabitur rutrum ipsum eget augue accumsan, in porta velit dignissim. Integer mattis vulputate arcu, in aliquet tellus lobortis auctor. Phasellus lacus augue, ultrices mattis ultrices et, euismod quis erat."
        />
        <FooterContent
          title="Monitoring"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac consectetur diam. Pellentesque lacinia, erat ac efficitur molestie, sapien odio efficitur purus, non ornare sem massa euismod metus. Maecenas at dolor tortor. Praesent sit amet mauris augue. Curabitur rutrum ipsum eget augue accumsan, in porta velit dignissim. Integer mattis vulputate arcu, in aliquet tellus lobortis auctor. Phasellus lacus augue, ultrices mattis ultrices et, euismod quis erat."
        />
        <FooterContent
          title="How we work"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac consectetur diam. Pellentesque lacinia, erat ac efficitur molestie, sapien odio efficitur purus, non ornare sem massa euismod metus. Maecenas at dolor tortor. Praesent sit amet mauris augue. Curabitur rutrum ipsum eget augue accumsan, in porta velit dignissim. Integer mattis vulputate arcu, in aliquet tellus lobortis auctor. Phasellus lacus augue, ultrices mattis ultrices et, euismod quis erat."
        />
      </Row>
      <FooterEnd />
    </>
  );
};

export default Footer;
