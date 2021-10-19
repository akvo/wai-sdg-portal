import React from "react";
import { Row, Col, Space, Input, Button, Table } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { SelectLevel } from "../../components/common";

import { manageDataColumns, manageDataSources } from "./admin-static";

const { Search } = Input;

const ManageData = () => {
  return (
    <>
      <div className="filter-wrapper">
        <Space size={10} align="center" wrap={true}>
          <Search
            className="search"
            placeholder="Search"
            onSearch={() => console.log("search")}
          />
          <SelectLevel />
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
    </>
  );
};

export default ManageData;
