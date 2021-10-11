import React from "react";
import { Drawer, Space, Avatar, Menu, Row, Col, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UIState } from "../state/ui";

const { SubMenu, Divider } = Menu;

const Navigation = () => {
  const visible = UIState.useState((s) => s.showNav);
  const onClose = () => {
    UIState.update((s) => {
      s.showNav = false;
    });
  };
  return (
    <>
      <Drawer
        title={
          <div className="header-logo">
            <Space size={20}>
              <Avatar src="./wai-logo.png" alt="wai-logo" />
              WAI Ethiopia
            </Space>
          </div>
        }
        className="menu-drawer-container"
        placement="right"
        onClose={onClose}
        visible={visible}
      >
        <Menu mode="inline" defaultOpenKeys="jmp">
          <Menu.Item key="water">Water</Menu.Item>
          <Divider />
          <Menu.Item key="clts">CLTS</Menu.Item>
          <Divider />
          <SubMenu key="jmp" title="JMP">
            <Menu.Item key="households">Households</Menu.Item>
            <Menu.Item key="schools">Schools</Menu.Item>
            <Menu.Item key="health-facilities">Health Facilities</Menu.Item>
          </SubMenu>
          <Divider />
          <Menu.Item key="admin">Admin</Menu.Item>
          <Divider />
          <Menu.Item key="about">About</Menu.Item>
        </Menu>
        <Row
          className="auth-button-wrapper"
          align="middle"
          justify="space-around"
          wrap={true}
        >
          <Col span={6}>
            <Button icon={<UserOutlined />}>Login</Button>
          </Col>
          <Col span={6}>
            <Button type="link">Signup</Button>
          </Col>
        </Row>
      </Drawer>
    </>
  );
};

export default Navigation;
