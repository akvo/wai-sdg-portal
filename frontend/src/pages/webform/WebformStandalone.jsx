import React from 'react';
import './webform.scss';
import { Webform } from 'akvo-react-form';
import 'akvo-react-form/dist/index.css';
import { UIState } from '../../state/ui';
import WebformLogin from './WebformLogin';
import { Row, Col, notification } from 'antd';
import api from '../../util/api';

const { notificationText } = window.i18n;

const WebformStandalone = ({ match }) => {
  const uuid = match?.params?.uuid;
  const { isLogin, formValue, submitter } = UIState.useState(
    (s) => s.webformLogin
  );

  const onFinish = (values) => {
    let data = Object.keys(values).map((v) => {
      // do not transfrom datapoint to post params
      if (values[v] && v !== 'datapoint') {
        return { question: parseInt(v), value: values[v] };
      }
      return false;
    });
    data = data.filter((x) => x);
    api
      .post(
        `data/form-standalone/${formValue?.id}?submitter=${submitter}`,
        data
      )
      .then((res) => {
        notification.success({
          message: `${res.data.id} - ${res.data.name} submitted.`,
        });
        setTimeout(() => {
          UIState.update((s) => {
            s.webformLogin = {
              submitter: null,
              isLogin: false,
              formValue: {},
            };
          });
        }, 1000);
      })
      .catch(() => {
        notification.error({
          message: notificationText?.errorText,
        });
      });
  };

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
            onFinish={onFinish}
            sticky={true}
          />
        </Col>
      </Row>
    </div>
  );
};

export default WebformStandalone;
