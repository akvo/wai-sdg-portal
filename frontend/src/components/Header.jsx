import React from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Card,
  List,
  Badge,
  Avatar,
  Space,
  Popover,
} from 'antd';
import {
  MenuOutlined,
  FieldTimeOutlined,
  UserOutlined,
  ExclamationCircleTwoTone,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DownloadOutlined,
} from '@ant-design/icons';
import { UIState } from '../state/ui';

const {
  noActivityText,
  activityLogText,
  recentActivityLogText,
  attachmentText,
} = window?.i18n?.header;

const { loginText, logoutText } = window?.i18n?.navigation;

const IconList = ({ type }) => {
  if (type === 'warning') {
    return <ExclamationCircleTwoTone twoToneColor="#c4c41a" />;
  }
  if (type === 'danger') {
    return <CloseCircleTwoTone twoToneColor="#eb2f96" />;
  }
  return <CheckCircleTwoTone twoToneColor="#52c41a" />;
};

const ActivityLog = () => {
  const { activityLog } = UIState.useState((c) => c);
  if (activityLog.length) {
    return (
      <List
        size="small"
        itemLayout="horizontal"
        dataSource={activityLog}
        renderItem={(item) => {
          let desc = item.status;
          if (item?.attachment) {
            desc = (
              <div>
                {item.status}
                <a
                  className="attachment-badge"
                  href={item.attachment}
                >
                  <DownloadOutlined /> {attachmentText}
                </a>
              </div>
            );
          }
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<IconList type={item.icon} />}
                title={item.file}
                description={desc}
              />
            </List.Item>
          );
        }}
      />
    );
  }
  return <Card>{noActivityText}</Card>;
};

const Header = ({ logout, loginWithPopup, isAuthenticated }) => {
  const { user, activityLog } = UIState.useState((c) => c);
  const onOpen = () => {
    UIState.update((s) => {
      s.showNav = true;
    });
  };
  return (
    <Row
      align="middle"
      justify="space-between"
      wrap={true}
    >
      <Col
        span={8}
        className="header-logo"
      >
        <Link to="/">
          <Space size={20}>
            <Avatar
              src="/wai-logo.png"
              alt="wai-logo"
            />
            <div className="web-title">{window.site_name}</div>
          </Space>
        </Link>
      </Col>
      <Col
        span={8}
        className="header-menu"
      >
        <Space size={20}>
          {/* Activity Log  */}
          {user && (
            <Popover
              title={recentActivityLogText}
              placement="bottom"
              content={<ActivityLog />}
              trigger="click"
            >
              <Badge count={activityLog.length}>
                <Button icon={<FieldTimeOutlined />}>{activityLogText}</Button>
              </Badge>
            </Popover>
          )}
          {/* Login, Sign-up - Logout button */}
          {!isAuthenticated ? (
            <Button
              icon={<UserOutlined />}
              onClick={loginWithPopup}
            >
              {loginText}
            </Button>
          ) : (
            <Button
              icon={<UserOutlined />}
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              {logoutText}
            </Button>
          )}
          {/* User profile button */}
          {user && user?.picture ? (
            <Avatar
              src={`${user.picture}#${window.location.origin}/img.jpg`}
              alt="user-avatar"
            />
          ) : user ? (
            user(
              <Avatar
                icon={<UserOutlined />}
                alt="user-avatar"
              />
            )
          ) : (
            ''
          )}
          <MenuOutlined
            onClick={onOpen}
            className="menu-outlined"
          />
        </Space>
      </Col>
    </Row>
  );
};

export default Header;
