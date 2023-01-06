import React, { useState } from 'react';
import './webform.scss';
import { Row, Col, Form, Input, Button, Card, notification } from 'antd';
import { UIState } from '../../state/ui';
import api from '../../util/api';

const WebformLogin = ({ uuid }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    const { submitter, passcode } = values;
    api
      .get(`/webform-standalone/${uuid}?passcode=${passcode}`)
      .then((res) => {
        UIState.update((s) => {
          s.webformLogin = {
            submitter: submitter,
            isLogin: true,
            formValue: res.data,
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
          span={8}
          align="center"
        >
          <Card
            title="Form Name - 1.0"
            className="webform-login-card"
          >
            <Form
              form={form}
              name="webform_standalone_login_form"
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                label="Submitter Name"
                name="submitter"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Form Passcode"
                name="passcode"
                rules={[{ required: true }]}
              >
                <Input type="password" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WebformLogin;
