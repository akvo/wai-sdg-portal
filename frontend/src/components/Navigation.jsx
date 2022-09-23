import React, { useEffect } from 'react';
import { Drawer, Space, Avatar, Menu } from 'antd';
import { UIState } from '../state/ui';
import { Link } from 'react-router-dom';
import { startCase } from 'lodash';

const navigationOptions = window.navigation_config;
const sitename = window.site_name;
const { adminText, aboutText } = window?.i18n?.navigation;

const Navigation = () => {
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
    document.title =
      startCase(page !== '' ? page : 'Home', '-') +
      ' | ' +
      window.site_name.toUpperCase();
  }, [page]);

  return (
    <>
      <Drawer
        title={
          <div className="header-logo">
            <Link to="/">
              <Space size={20}>
                <Avatar
                  src="/wai-logo.png"
                  alt="wai-logo"
                />
                <div className="web-title">{sitename}</div>
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
                  <Menu.ItemGroup
                    title={item.name}
                    key={`${item.link}`}
                  >
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
          {(user?.role === 'admin' || user?.role === 'editor') && (
            <Menu.Item key="admin">
              <Link to="/admin/manage-data">{adminText}</Link>
            </Menu.Item>
          )}
          <Menu.Item key="about">{aboutText}</Menu.Item>
        </Menu>
      </Drawer>
    </>
  );
};

export default Navigation;
