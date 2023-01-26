import React, { useState } from 'react';
import './webform.scss';
import { Webform, SavedSubmission } from 'akvo-react-form';
import 'akvo-react-form/dist/index.css';
import { UIState } from '../../state/ui';
import WebformLogin from './WebformLogin';
import WebformCaptcha from './WebformCaptcha';
import { Row, Col, Button, notification } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import api from '../../util/api';

const { notificationText, buttonText, formText } = window.i18n;

const WebformStandalone = ({ location }) => {
  const uuid = location?.search?.split('id=')?.[1];
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [payload, setPayload] = useState([]);
  const { isLogin, formValue, submitter, complete } = UIState.useState(
    (s) => s.webformLogin
  );

  const { id: formId } = formValue;
  const dataPointName = `${formId} - ${submitter}`;

  const onSubmit = () => {
    setIsVisible(false);
    if (!payload.length) {
      return;
    }
    setSubmitting(true);
    api
      .post(
        `data/form-standalone/${formValue?.id}?submitter=${submitter}`,
        payload
      )
      .then((res) => {
        notification.success({
          message: `${res.data.id} - ${res.data.name} submitted.`,
        });
        setTimeout(() => {
          UIState.update((s) => {
            s.webformLogin = {
              ...s.webformLogin,
              complete: true,
            };
          });
        }, 1000);
      })
      .catch(() => {
        notification.error({
          message: navigator.onLine ? (
            notificationText?.errorText
          ) : (
            <>
              You are <i>offline</i>, please <b>Save</b> your submission and{' '}
              <i>Submit</i> once you back online.
            </>
          ),
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const onFinish = (values) => {
    let data = Object.keys(values).map((v) => {
      // do not transfrom datapoint to post params
      if (values[v] && v !== 'datapoint') {
        return { question: parseInt(v), value: values[v] };
      }
      return false;
    });
    data = data.filter((x) => x);
    setPayload(data);
    setIsVisible(true);
  };

  const handleAddNewSubmission = () => {
    UIState.update((s) => {
      s.webformLogin = {
        ...s.webformLogin,
        complete: false,
      };
    });
  };

  if (!isLogin) {
    return <WebformLogin uuid={uuid} />;
  }

  if (complete) {
    return (
      <div className="webform-standalone-container">
        <Row
          align="center"
          className="webform-complete-wrapper"
        >
          <Col
            span={24}
            align="center"
          >
            <FormOutlined style={{ fontSize: '40px' }} />
            <h2>Thank you for your submission!</h2>
            <Button onClick={handleAddNewSubmission}>
              {buttonText?.btnAddNewSubmission}
            </Button>
          </Col>
        </Row>
      </div>
    );
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
            submitButtonSetting={{ loading: submitting }}
            autoSave={{
              formId: formId,
              name: dataPointName,
              buttonText: buttonText?.btnSave,
            }}
            leftDrawerConfig={{
              visible: true,
              title: formText?.savedSubmissionText,
              content: <SavedSubmission formId={formId} />,
            }}
          />
        </Col>
      </Row>
      <WebformCaptcha
        isVisible={isVisible}
        onOk={onSubmit}
        onCancel={() => setIsVisible(false)}
        submitting={submitting}
      />
    </div>
  );
};

export default WebformStandalone;
