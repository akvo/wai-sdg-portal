import React, { useEffect, useState } from 'react';
import { UIState } from '../state/ui';
import {
  Row,
  Col,
  Modal,
  Form,
  Input,
  Avatar,
  Select,
  Button,
  notification,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { NonActiveUserMessage } from './Notifications';
import api from '../util/api';

const { notificationText, formText, buttonText, mainText } = window.i18n;
const fieldValues = ['email', 'first_name', 'last_name', 'organisation'];
const { Option } = Select;

const RegistrationPopup = ({ user, logout }) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(true);
  const [confirmAwait, setConfirmAwait] = useState(false);
  const [organisation, setOrganisation] = useState([]);
  const [organisationLoaded, setOrganisationLoaded] = useState(false);
  const visible = UIState.useState((s) => s.registrationPopup);

  const register = () => {
    setConfirmAwait(true);
    const data = form.getFieldsValue(fieldValues);
    api
      .post('user', null, { params: data })
      .then(() => {
        setTimeout(() => {
          UIState.update((s) => {
            s.registrationPopup = false;
          });
          notification.warning({
            message: <NonActiveUserMessage user={user} />,
          });
        }, 2000);
      })
      .catch(() => {
        notification.warning({
          message: notificationText?.errorText,
        });
        setConfirmAwait(false);
      });
  };

  const cancel = () => {
    logout({ returnTo: `${window.location.origin}/login` });
  };

  useEffect(() => {
    if (!organisationLoaded) {
      api
        .get('organisation')
        .then((e) => {
          setOrganisation(e.data);
          form.setFieldsValue({
            email: user?.email,
            first_name: user?.family_name || '',
            last_name: user?.given_name || '',
          });
          setFormLoading(false);
          setOrganisationLoaded(true);
        })
        .catch(() => {
          setOrganisationLoaded(true);
        });
    }
  }, [form, user, organisationLoaded]);

  if (formLoading) {
    return '';
  }

  return (
    <Modal
      title={mainText?.modalRegistrationTitle}
      centered
      visible={visible}
      footer={null}
    >
      <Row style={{ paddingBottom: '20px' }}>
        <Col
          span={24}
          align="center"
        >
          {user?.picture ? (
            <Avatar
              size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
              src={`${user.picture}#${window.location.origin}/img.jpg`}
              alt="user-avatar"
            />
          ) : (
            <Avatar
              size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
              icon={<UserOutlined />}
              alt="user-avatar"
            />
          )}
        </Col>
      </Row>
      <Form
        layout="vertical"
        form={form}
        name="registration-form"
        onFinish={register}
      >
        <Form.Item
          name="email"
          label={formText?.labelEmail}
          tooltip={{
            title: (
              <Button
                icon={<UserOutlined />}
                onClick={cancel}
                type="link"
              >
                {buttonText?.btnUseAnotherEmail}
              </Button>
            ),
            color: '#FFF',
          }}
        >
          <Input disabled />
        </Form.Item>
        <Row
          justify="space-between"
          wrap={true}
        >
          <Col span={11}>
            <Form.Item
              name="first_name"
              label={formText?.labelFirstName}
              rules={[
                {
                  required: true,
                  message: formText?.validationNameRequiredText,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              name="last_name"
              label={formText?.labelLastName}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="organisation"
          label={formText?.labelOrg}
          rules={[{ required: true }]}
        >
          <Select>
            {organisation.map((x) => (
              <Option
                key={x.id}
                value={x.id}
              >
                {x.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Row
          style={{ paddingTop: '20px' }}
          justify="center"
        >
          <Col
            span={6}
            align="center"
          >
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={confirmAwait}
                disabled={confirmAwait}
              >
                {buttonText?.btnSubmit}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RegistrationPopup;
