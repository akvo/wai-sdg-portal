import React, { useState, useEffect } from 'react';
import './webform.scss';
import { Row, Col, Form, Input, Button, Card, Spin, notification } from 'antd';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import isEmpty from 'lodash/isEmpty';

const WebformLogin = ({ uuid }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formDetail, setFormDetail] = useState({});
  const isLoadingDetail = isEmpty(formDetail);

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
                    disabled={isLoadingDetail}
                  >
                    Login
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
