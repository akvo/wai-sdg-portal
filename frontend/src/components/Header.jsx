import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Button, Badge, Avatar, Space } from "antd";
import {
  MenuOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { UIState } from "../state/ui";

const Header = () => {
  const { page, user, visible } = UIState.useState((c) => c);
  const onOpen = () => {
    UIState.update((s) => {
      s.showNav = true;
    });
  };
  return (
    <Row align="middle" justify="space-between" wrap={true}>
      <Col span={8} className="header-logo">
        <Link to="/">
          <Space size={20}>
            <Avatar src="./wai-logo.png" alt="wai-logo" />
            WAI Ethiopia
          </Space>
        </Link>
      </Col>
      <Col span={8} className="header-menu">
        <Space size={20}>
          {user && (
            <>
              <Badge count={5}>
                <Button icon={<FieldTimeOutlined />}>Activity Log</Button>
              </Badge>
              {user?.picture ? (
                <Avatar
                  src={`${user.picture}#${window.location.origin}/img.jpg`}
                  alt="user-avatar"
                />
              ) : (
                <Avatar icon={<UserOutlined />} alt="user-avatar" />
              )}
            </>
          )}
          <MenuOutlined onClick={onOpen} className="menu-outlined" />
        </Space>
      </Col>
    </Row>
  );
};

export default Header;
