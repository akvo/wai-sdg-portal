import React from "react";
import { Row, Col, Space, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { SelectFilter } from "../../components/common";

const Export = () => {
  return (
    <>
      <Row className="filter-wrapper" align="middle" justify="space-between">
        <Col span={18}>
          <Space size={10} align="center" wrap={true}>
            <SelectFilter placeholder="Select Dataset" />
            <SelectFilter placeholder="Select Woreda" />
            <SelectFilter placeholder="Select Kebele" />
          </Space>
        </Col>
        <Col span={4} align="end">
          <Button
            className="sort-by-button"
            type="link"
            icon={<FilterOutlined />}
          >
            Sort by
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Export;
