import React from "react";
import { Row, Col, Tabs, Select, Input, Button, Space, Table } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import "./admin.scss";

import {
  manageDataColumns,
  manageDataSources,
  userColumns,
  userSources,
} from "./admin-static";

const { TabPane } = Tabs;
const { Search } = Input;

const Admin = () => {
  return (
    <Row className="admin-container">
      {/* Jumbotron */}
      <Col span={24}>
        <Row className="jumbotron-container">
          <Col span={24} className="container">
            <h1>Welcome Admin</h1>
          </Col>
        </Row>
      </Col>
      {/* Content */}
      <Col span={24} className="container content-wrapper">
        <div className="card-container">
          <Tabs type="card" size="large" tabBarGutter={0}>
            <TabPane tab="Manage Data" key="manage-data">
              <ManageData />
            </TabPane>
            <TabPane tab="Manage Users" key="manage-users">
              <ManageUser />
            </TabPane>
          </Tabs>
        </div>
      </Col>
    </Row>
  );
};

const ManageData = () => {
  return (
    <div>
      <div className="filter-wrapper">
        <Space size={10} align="center" wrap={true}>
          <Search
            className="search"
            placeholder="Search"
            onSearch={() => console.log("search")}
          />
          <SelectFilter placeholder="Select Dataset" />
          <SelectFilter placeholder="Select Woreda" />
          <SelectFilter placeholder="Select Kebele" />
          <Button className="remove-filter-button">Remove Filter</Button>
        </Space>
      </div>
      <Row
        className="button-wrapper"
        align="middle"
        justify="space-between"
        wrap={true}
      >
        <Col span={4} align="start">
          <Button className="advanced-filter-button" icon={<FilterOutlined />}>
            Advanced Filters
          </Button>
        </Col>
        <Col span={4} align="end">
          <Button type="primary" className="export-filter-button">
            Export Filtered Data
          </Button>
        </Col>
      </Row>
      <div className="table-wrapper">
        <Table
          dataSource={manageDataSources}
          columns={manageDataColumns}
          pagination={{ position: ["bottomCenter"] }}
        />
      </div>
    </div>
  );
};

const ManageUser = () => {
  return (
    <div>
      <div className="table-wrapper">
        <Table
          dataSource={userSources}
          columns={userColumns}
          pagination={{ position: ["bottomCenter"] }}
        />
      </div>
    </div>
  );
};

const SelectFilter = ({ placeholder }) => {
  return (
    <Select
      showSearch
      placeholder={placeholder}
      options={[]}
      optionFilterProp="label"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      className="filter-select"
    />
  );
};

export default Admin;
