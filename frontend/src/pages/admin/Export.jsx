import React, { useState } from "react";
import { Row, Col, Space, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { SelectLevel } from "../../components/common";

const Export = () => {
  const [page, setPage] = useState(1);

  return (
    <>
      <Row className="filter-wrapper" align="middle" justify="space-between">
        <Col span={18}>
          <Space size={10} align="center" wrap={true}>
            <SelectLevel setPage={setPage} />
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
