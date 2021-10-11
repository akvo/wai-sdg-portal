import React from "react";
import { Row, Col, Button, Avatar, Space } from "antd";
import {
  MenuOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { UIState } from "../state/ui";

const Header = () => {
  const visible = UIState.useState((s) => s.visible);
  const onOpen = () => {
    UIState.update((s) => {
      s.showNav = true;
    });
  };
  return (
    <Row align="middle" justify="space-between" wrap={true}>
      <Col span={8} className="header-logo">
        <Space size={20}>
          <Avatar src="./wai-logo.png" alt="wai-logo" />
          WAI Ethiopia
        </Space>
      </Col>
      <Col span={8} className="header-menu">
        <Space size={20}>
          <Button icon={<FieldTimeOutlined />}>Activity Log</Button>
          <Avatar icon={<UserOutlined />} alt="user-avatar" />
          <MenuOutlined onClick={onOpen} className="menu-outlined" />
        </Space>
      </Col>
    </Row>
  );
};

export default Header;
