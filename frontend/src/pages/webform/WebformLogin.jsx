import React, { useState, useEffect, useMemo } from 'react';
import './webform.scss';
import { Row, Col, Form, Input, Button, Card, Spin, notification } from 'antd';
import { UIState } from '../../state/ui';
import ErrorPage from '../../components/ErrorPage';
import api from '../../util/api';
import isEmpty from 'lodash/isEmpty';

const { buttonText, formText } = window.i18n;

const WebformLogin = ({ uuid }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formDetail, setFormDetail] = useState({});
  const isLoadingDetail = isEmpty(formDetail);
  const allowUsingPasscode = formDetail?.passcode !== null;

  const cardTitle = useMemo(() => {
    if (isEmpty(formDetail) && formDetail?.error) {
      return '';
    }
    return formDetail?.version
      ? `${formDetail?.name} - v${formDetail?.version}`
      : formDetail?.name;
  }, [formDetail]);

  useEffect(() => {
    api
      .get(`/webform-standalone/${uuid}`)
      .then((res) => {
        setFormDetail(res.data);
      })
      .catch(() => {
        setFormDetail({
          error: true,
          status: 404,
        });
        notification.error({
          message: 'Form not found, please contact your admin.',
        });
      });
  }, [uuid]);

  const onWebformLogin = (values) => {
    setLoading(true);
    const { submitter, passcode } = values;
    if (allowUsingPasscode && navigator.onLine) {
      const data = new FormData();
      data.append('uuid', uuid);
      data.append('passcode', passcode);
      api
        .post('webform-standalone/login', data)
        .then(() => {
          UIState.update((s) => {
            s.webformLogin = {
              ...s.webformLogin,
              submitter: submitter,
              isLogin: true,
              formValue: formDetail,
              complete: false,
            };
          });
        })
        .catch(() => {
          notification.error({
            message: 'Please check form passcode.',
          });
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    if (allowUsingPasscode && !navigator.onLine) {
      if (passcode === formDetail?.passcode) {
        UIState.update((s) => {
          s.webformLogin = {
            ...s.webformLogin,
            submitter: submitter,
            isLogin: true,
            formValue: formDetail,
            complete: false,
          };
        });
      } else {
        notification.error({
          message: 'Please check form passcode.',
        });
      }
    }
    if (!allowUsingPasscode) {
      UIState.update((s) => {
        s.webformLogin = {
          ...s.webformLogin,
          submitter: submitter,
          isLogin: true,
          formValue: formDetail,
          complete: false,
        };
      });
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // return error page
  if (formDetail?.error) {
    return <ErrorPage status={formDetail?.status} />;
  }

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
              title={cardTitle}
              className="webform-login-card"
            >
              <Form
                form={form}
                name="webform_standalone_login_form"
                layout="vertical"
                onFinish={onWebformLogin}
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
