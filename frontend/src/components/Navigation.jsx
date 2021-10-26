import React, { useEffect } from "react";
import { Drawer, Space, Avatar, Menu, Row, Col, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UIState } from "../state/ui";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";

import { navigationOptions } from "./common";

const Navigation = ({ logout, loginWithPopup, isAuthenticated }) => {
  const { page, user } = UIState.useState((c) => c);
  const visible = UIState.useState((s) => s.showNav);

  const onClose = () => {
    UIState.update((s) => {
      s.showNav = false;
    });
  };
  const changePage = ({ key }) => {
    UIState.update((s) => {
      s.page = key;
      s.showNav = false;
    });
  };

  useEffect(() => {
    document.title = startCase(page !== "" ? page : "Home", "-");
  }, [page]);

  return (
    <>
      <Drawer
        title={
          <div className="header-logo">
            <Link to="/">
              <Space size={20}>
                <Avatar src="./wai-logo.png" alt="wai-logo" />
                WAI Ethiopia
              </Space>
            </Link>
          </div>
        }
        className="menu-drawer-container"
        placement="right"
        onClose={onClose}
        visible={visible}
      >
        <Menu
          mode="inline"
          onSelect={changePage}
          defaultOpenKeys="jmp"
          selectedKeys={[page]}
        >
          {user?.active && (
            <>
              {navigationOptions.map((item) => {
                return item.childrens ? (
                  <Menu.ItemGroup title={item.name} key={`${item.link}`}>
                    {item?.childrens?.map((child) => (
                      <Menu.Item key={`${child.link}`}>
                        <Link to={`/data/${child.link}`}>{child.name}</Link>
                      </Menu.Item>
                    ))}
                  </Menu.ItemGroup>
                ) : (
                  <Menu.Item key={`${item.link}`}>
                    <Link to={`/data/${item.link}`}>{item.name}</Link>
                  </Menu.Item>
                );
              })}
            </>
          )}
          {(user?.role === "admin" || user?.role === "editor") && (
            <Menu.Item key="admin">
              <Link to="/admin/manage-data">Admin</Link>
            </Menu.Item>
          )}
          <Menu.Item key="about">About</Menu.Item>
        </Menu>
        <Row
          className="auth-button-wrapper"
          align="middle"
          justify="space-around"
          wrap={true}
        >
          {!isAuthenticated ? (
            <>
              <Col span={6}>
                <Button icon={<UserOutlined />} onClick={loginWithPopup}>
                  Login
                </Button>
              </Col>
              <Col span={6}>
                <Button type="link">Signup</Button>
              </Col>
            </>
          ) : (
            <>
              <Col span={12}>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  Logout
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Drawer>
    </>
  );
};

export default Navigation;
