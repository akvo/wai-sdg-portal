import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Space,
  Button,
  Checkbox,
  Table,
  notification,
  Tag,
} from "antd";
import api from "../../util/api";
import capitalize from "lodash/capitalize";
import isEmpty from "lodash/isEmpty";
import { UIState } from "../../state/ui";

const ManageUser = () => {
  const organisations = UIState.useState((s) => s.organisations);
  const [showPendingUser, setShowPendingUser] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [paginate, setPaginate] = useState({
    total: 1,
    current: 1,
    pageSize: 10,
  });

  const active = showPendingUser ? 0 : 1;

  const handleApproveButton = (user) => {
    api
      .put(`/user/${user.id}?active=1&role=${user.role}`)
      .then((res) => {
        notification.success({
          message: "User approved",
        });
        getUsers(active, 1);
      })
      .catch((err) => {
        console.error(err);
        setUsers([]);
        notification.error({
          message: "Ops, something went wrong",
        });
      });
  };

  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (val, prop) => {
        return !active ? (
          <Space size="small">
            {val}{" "}
            <Tag color={prop.email_verified ? "green" : "red"}>
              {prop.email_verified ? "verified" : "not verified"}
            </Tag>
          </Space>
        ) : (
          val
        );
      },
    },
    {
      title: "Organisation",
      dataIndex: "organisation",
      key: "organisation",
      render: (val, prop) => organisations?.find((org) => org.id === val)?.name,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (val, prop) => capitalize(val),
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (val, prop) => (
        <Space size="small" align="center" wrap={true}>
          {active ? (
            <>
              <Button type="link">Edit</Button>
              <Button type="link">Delete</Button>
            </>
          ) : (
            <Button
              type="default"
              disabled={!prop.email_verified}
              onClick={() => handleApproveButton(prop)}
            >
              Approve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getUsers = useCallback((active, page = 1, pageSize = 10) => {
    setTableLoading(true);
    api
      .get(`/user/?active=${active}&page=${page}`)
      .then((res) => {
        setUsers(res.data?.data);
        setPaginate({
          current: res.data.current,
          total: res.data.total,
          pageSize: pageSize,
        });
      })
      .catch((err) => {
        console.error(err);
        setUsers([]);
        notification.error({
          message: "Ops, something went wrong",
        });
      })
      .finally(() => {
        setTableLoading(false);
      });
  }, []);

  useEffect(() => {
    !isEmpty(organisations) && getUsers(active);
  }, [getUsers, active, organisations]);

  const handleTableChange = (pagination) => {
    const { current, pageSize } = pagination;
    !isEmpty(organisations) && getUsers(active, current, pageSize);
  };

  return (
    <>
      <Row align="middle" className="checkbox-wrapper">
        <Col span={24} align="end">
          <Space align="center">
            <Button
              className="checkbox-label"
              type="link"
              onClick={() => setShowPendingUser(!showPendingUser)}
            >
              Show Pending Users
            </Button>
            <Checkbox
              className="checkbox-input"
              onChange={(e) => setShowPendingUser(e.target.checked)}
              checked={showPendingUser}
              disabled={isEmpty(organisations) || tableLoading}
            />
          </Space>
        </Col>
      </Row>
      <div className="table-wrapper">
        <Table
          rowKey={(record) => record.id}
          dataSource={users}
          columns={userColumns}
          loading={tableLoading}
          onChange={handleTableChange}
          pagination={{
            current: paginate.current,
            total: paginate.total,
          }}
        />
      </div>
    </>
  );
};

export default ManageUser;
