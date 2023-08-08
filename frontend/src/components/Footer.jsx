import React from 'react';
import { Row, Col } from 'antd';
import { UIState } from '../state/ui';
import { Link } from 'react-router-dom';

const { footer } = window.i18n;

/* ## FIXME: Enable once footer text is ready
const FooterContent = ({ title, text }) => {
  return (
    <Col span={7}>
      <h2>{title}</h2>
      {text}
    </Col>
  );
};
*/

const FooterEnd = ({ isWebformStandalone }) => {
  const { user } = UIState.useState((c) => c);
  const changePage = ({ key }) => {
    UIState.update((s) => {
      s.page = key;
    });
  };
  return (
    <Row
      className="footer-end"
      align="space-between"
    >
      <Col
        span={16}
        className="start"
      >
        © 2021
      </Col>
      <Col
        span={8}
        className="end"
      >
        {/* <Link to="/privacy-policy">{footer?.privacyPolicy}</Link> */}
        {/* <Link to="/tos">{footer?.termsOfService}</Link> */}
        {user &&
          !isWebformStandalone && [
            <Link
              key="api-documentation"
              to="/api-docs"
              onClick={() => changePage('documentation')}
            >
              {footer?.documentation?.swagger}
            </Link>,
            <a
              key="user-documentation"
              href="/documentation/index.html"
              target="_blank"
            >
              {footer?.documentation?.rtd}
            </a>,
          ]}
      </Col>
    </Row>
  );
};

const Footer = ({ isWebformStandalone }) => {
  return (
    <>
      {/* ## FIXME: Enable once footer text is ready
      <Row align="space-between" className="footer-start">
        <FooterContent title={footer?.dataTitle} text={footer?.dataText} />
        <FooterContent
          title={footer?.monitoringTitle}
          text={footer?.monitoringText}
        />
        <FooterContent title={footer?.workTitle} text={footer?.workText} />
      </Row>
        */}
      <FooterEnd isWebformStandalone={isWebformStandalone} />
    </>
  );
};

export default Footer;
