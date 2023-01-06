import React from 'react';
import './webform.scss';
import { Webform } from 'akvo-react-form';
import 'akvo-react-form/dist/index.css';
import { UIState } from '../../state/ui';
import WebformLogin from './WebformLogin';
import { Row, Col } from 'antd';

const WebformStandalone = ({ match }) => {
  const uuid = match?.params?.uuid;
  const { isLogin, formValue /*submitter*/ } = UIState.useState(
    (s) => s.webformLogin
  );

  if (!isLogin) {
    return <WebformLogin uuid={uuid} />;
  }

  return (
    <div className="webform-standalone-container">
      <Row>
        <Col
          span={24}
          className="webform"
        >
          <Webform
            forms={formValue}
            // onFinish={onFinish}
            // onChange={onChange}
            sticky={true}
          />
        </Col>
      </Row>
    </div>
  );
};

export default WebformStandalone;
