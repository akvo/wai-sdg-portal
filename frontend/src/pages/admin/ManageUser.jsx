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

import { userColumns } from "./admin-static";

const defUsers = {
  current: 1,
  data: [],
  total: 0,
  total_page: 0,
};

const ManageUser = () => {
  const organisations = UIState.useState((s) => s.organisations);
  const [showPendingUser, setShowPendingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(defUsers);

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
        setUsers(defUsers);
        notification.error({
          message: "Ops, something went wrong",
        });
      });
  };

  const getUsers = useCallback((active, page) => {
    setLoading(true);
    api
      .get(`/user/?active=${active}&page=${page}`)
      .then((res) => {
        const data = res.data?.data?.map((x) => {
          const emailStatus = (
            <Tag color={x.email_verified ? "green" : "red"}>
              {x.email_verified ? "verified" : "not verified"}
            </Tag>
          );
          return {
            ...x,
            email: !active ? (
              <Space size="small">
                {x.email} {emailStatus}
              </Space>
            ) : (
              x.email
            ),
            organisation: organisations?.find(
              (org) => org.id === x.organisation
            )?.name,
            role: capitalize(x.role),
            action: (
              <Space size="small" align="center" wrap={true}>
                {active ? (
                  <>
                    <Button type="link">Edit</Button>
                    <Button type="link">Delete</Button>
                  </>
                ) : (
                  <Button
                    type="default"
                    disabled={!x.email_verified}
                    onClick={() => handleApproveButton(x)}
                  >
                    Approve
                  </Button>
                )}
              </Space>
            ),
          };
        });
        setUsers({ ...res.data, data: data });
      })
      .catch((err) => {
        console.error(err);
        setUsers(defUsers);
        notification.error({
          message: "Ops, something went wrong",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    !isEmpty(organisations) && getUsers(active, defUsers.current);
  }, [getUsers, active, organisations]);

  const handleTableChange = (pagination, filters, sorter) => {
    const { current } = pagination;
    !isEmpty(organisations) && getUsers(active, current);
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
              disabled={isEmpty(organisations) || loading}
            />
          </Space>
        </Col>
      </Row>
      <div className="table-wrapper">
        <Table
          rowKey={(record) => record.id}
          dataSource={users.data}
          columns={userColumns}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: users.current,
            total: users.total,
          }}
        />
      </div>
    </>
  );
};

export default ManageUser;
