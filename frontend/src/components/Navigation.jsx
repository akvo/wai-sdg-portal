import React, { useEffect } from "react";
import { Drawer, Space, Avatar, Menu, Row, Col, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UIState } from "../state/ui";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";

const { SubMenu } = Menu;

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
              <Menu.Item key="water">
                <Link to="/data/water">Water</Link>
              </Menu.Item>
              <Menu.Item key="clts">
                <Link to="/data/clts">CLTS</Link>
              </Menu.Item>
              <Menu.ItemGroup key="jmp" title="JMP">
                <Menu.Item key="households">
                  <Link to="/data/households">Households</Link>
                </Menu.Item>
                <Menu.Item key="schools">
                  <Link to="/data/schools">Schools</Link>
                </Menu.Item>
                <Menu.Item key="health">
                  <Link to="/data/health">Health Facilities</Link>
                </Menu.Item>
              </Menu.ItemGroup>
            </>
          )}
          {(user?.role === "admin" || user?.role === "editor") && (
            <Menu.Item key="admin">
              <Link to="/admin">Admin</Link>
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
