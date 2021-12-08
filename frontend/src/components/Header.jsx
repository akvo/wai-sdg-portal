import React from "react";
import { Link } from "react-router-dom";
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
} from "antd";
import {
  MenuOutlined,
  FieldTimeOutlined,
  UserOutlined,
  ExclamationCircleTwoTone,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DownloadOutlined,
} from "@ant-design/icons";
import { UIState } from "../state/ui";
import uiText from "../util/ui-text";

const {
  noActivity,
  activityLog,
  recentActivityLog,
  attachment,
} = uiText?.header;

const IconList = ({ type }) => {
  if (type === "warning") {
    return <ExclamationCircleTwoTone twoToneColor="#c4c41a" />;
  }
  if (type === "danger") {
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
                <a className="attachment-badge" href={item.attachment}>
                  <DownloadOutlined /> {attachment}
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
  return <Card>{noActivity}</Card>;
};

const Header = () => {
  const { user, activityLog } = UIState.useState((c) => c);
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
            <Avatar src="/wai-logo.png" alt="wai-logo" />
            <div className="web-title">{window.site_name}</div>
          </Space>
        </Link>
      </Col>
      <Col span={8} className="header-menu">
        <Space size={20}>
          {user && (
            <>
              <Popover
                title={recentActivityLog}
                placement="bottom"
                content={<ActivityLog />}
                trigger="click"
              >
                <Badge count={activityLog.length}>
                  <Button icon={<FieldTimeOutlined />}>{activityLog}</Button>
                </Badge>
              </Popover>
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
