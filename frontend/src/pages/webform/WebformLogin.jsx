import React from 'react';
import './webform.scss';
import { Row, Col, Form, Input, Button, Card } from 'antd';

const WebformLogin = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.info(values);
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
