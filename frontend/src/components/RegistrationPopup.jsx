import React, { useEffect, useState } from "react";
import { UIState } from "../state/ui";
import { Row, Col, Modal, Form, Input } from "antd";

const fieldValues = ["email", "firstName", "lastName"];

const RegistrationPopup = ({ user }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const visible = UIState.useState((s) => s.registrationPopup);

  const register = () => {
    setConfirmLoading(true);
    const data = form.getFieldsValue(fieldValues);
    console.log(data);
    setTimeout(() => {
      UIState.update((s) => {
        s.registrationPopup = false;
      });
      setConfirmLoading(false);
    }, 2000);
  };

  useEffect(() => {
    form.setFieldsValue({
      email: user?.email,
    });
  }, [user]);

  return (
    <Modal
      title="Register your account"
      centered
      visible={visible}
      onOk={register}
      okText="Register"
      confirmLoading={confirmLoading}
    >
      <Form layout="vertical" form={form} name="registration-form">
        <Form.Item name="email" label="Email">
          <Input disabled />
        </Form.Item>
        <Row justify="space-between" wrap={true}>
          <Col span={11}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RegistrationPopup;
