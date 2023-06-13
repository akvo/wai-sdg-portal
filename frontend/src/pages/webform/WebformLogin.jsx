import React, { useState, useEffect } from 'react';
import './webform.scss';
import { Row, Col, Form, Input, Button, Card, Spin, notification } from 'antd';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import isEmpty from 'lodash/isEmpty';

const { buttonText, formText } = window.i18n;

const WebformLogin = ({ uuid }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formDetail, setFormDetail] = useState({});
  const isLoadingDetail = isEmpty(formDetail);
  const allowUsingPasscode = formDetail?.passcode;

  useEffect(() => {
    api
      .get(`/form-standalone/${uuid}`)
      .then((res) => {
        setFormDetail(res.data);
      })
      .catch(() => {
        notification.error({
          message: 'Form not found, please contact your admin.',
        });
      });
  }, [uuid]);

  const onFinish = (values) => {
    setLoading(true);
    const { submitter, passcode } = values;
    let loginURL = `/webform-standalone/${uuid}`;
    if (allowUsingPasscode) {
      loginURL = `${loginURL}?passcode=${passcode}`;
    }
    api
      .get(loginURL)
      .then((res) => {
        UIState.update((s) => {
          s.webformLogin = {
            ...s.webformLogin,
            submitter: submitter,
            isLogin: true,
            formValue: res.data,
            complete: false,
          };
        });
      })
      .catch(() => {
        notification.error({
          message: 'Please check form passcode!',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="webform-standalone-container">
      <Row
        align="center"
        className="webform-login-wrapper"
      >
        <Col
          span={24}
          align="center"
        >
          {isLoadingDetail ? (
            <Spin />
          ) : (
            <Card
              title={`${formDetail?.name} - v${formDetail?.version}`}
              className="webform-login-card"
            >
              <Form
                form={form}
                name="webform_standalone_login_form"
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item
                  label={formText?.labelSubmitterName}
                  name="submitter"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                {allowUsingPasscode && (
                  <Form.Item
                    label={formText?.labelFormPasscode}
                    name="passcode"
                    rules={[{ required: true }]}
                  >
                    <Input type="password" />
                  </Form.Item>
                )}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    disabled={isLoadingDetail}
                  >
                    {buttonText?.btnLogin}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default WebformLogin;
