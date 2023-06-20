import React, { useState } from 'react';
import './webform.scss';
import { Webform, SavedSubmission } from 'akvo-react-form';
import 'akvo-react-form/dist/index.css';
import WebformLogin from './WebformLogin';
import WebformCaptcha from './WebformCaptcha';
import { Row, Col, Button, notification } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import api from '../../util/api';

const { notificationText, buttonText, formText } = window.i18n;

const createUniqueId = () => {
  const date = new Date();
  const components = [
    date.toLocaleDateString().replace(/\//g, '-'),
    date.toLocaleTimeString(),
  ];
  return components.join(' - ');
};

const WebformStandalone = ({ location }) => {
  const initialId = createUniqueId();
  const uuid = location?.search?.split('id=')?.[1];
  const [dataPointId, setDataPointId] = useState(initialId);
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [payload, setPayload] = useState([]);

  const [states, setStates] = useState({
    submitter: null,
    isLogin: false,
    formValue: {},
    complete: false,
  });

  const { isLogin, formValue, submitter, complete } = states;

  const { id: formId } = formValue;

  const onSubmit = (current) => {
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
          setStates({
            ...current,
            complete: true,
          });
        }, 1000);
      })
      .catch(() => {
        notification.error({
          message: navigator.onLine ? (
            notificationText?.errorText
          ) : (
            <>
              Looks like you are <i>offline</i>. Your submission has been{' '}
              <b>saved</b>. Please load it and submit once you are online.
            </>
          ),
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const onFinish = (values, refreshForm) => {
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
    const newId = createUniqueId();
    setDataPointId(newId);
    refreshForm();
  };

  const handleAddNewSubmission = (current) => {
    setStates({
      ...current,
      complete: false,
    });
  };

  if (!isLogin) {
    return (
      <WebformLogin
        uuid={uuid}
        setStates={setStates}
      />
    );
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
            <Button onClick={() => handleAddNewSubmission(states)}>
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
              name: `${submitter} - ${dataPointId}`,
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
        onOk={() => onSubmit(states)}
        onCancel={() => setIsVisible(false)}
        submitting={submitting}
      />
    </div>
  );
};

export default WebformStandalone;
