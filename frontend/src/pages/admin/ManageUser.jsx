import React, { useState } from "react";
import { Row, Col, Space, Button, Checkbox, Table } from "antd";

import { userColumns, userSources } from "./admin-static";

const ManageUser = () => {
  const [showPendingUser, setShowPendingUser] = useState(true);

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
            />
          </Space>
        </Col>
      </Row>
      <div className="table-wrapper">
        <Table
          dataSource={userSources}
          columns={userColumns}
          pagination={{ position: ["bottomCenter"] }}
        />
      </div>
    </>
  );
};

export default ManageUser;
