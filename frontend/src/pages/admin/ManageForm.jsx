import React, { useState } from 'react';
import { Row, Col, Button, Space } from 'antd';
import WebformEditor from 'akvo-react-form-editor';
import 'akvo-react-form-editor/dist/index.css';
import { DropdownNavigation } from '../../components/common';

const { buttonText } = window?.i18n;

const ManageForm = () => {
  const [form, setForm] = useState(Object.keys(window.page_config)[0]);

  const loadForm = () => {};
  return (
    <div className="main-wrapper">
      <div className="upload-wrapper">
        <Row
          className="filter-wrapper"
          align="middle"
          justify="space-between"
        >
          <Col
            span={24}
            align="center"
          >
            <Space
              size={20}
              align="center"
              wrap={true}
            >
              <DropdownNavigation
                value={form}
                onChange={setForm}
              />
              <Button onClick={loadForm}>{buttonText?.btnEdit}</Button>
            </Space>
          </Col>
        </Row>
      </div>
      <div className="upload-wrapper">
        <WebformEditor />
      </div>
    </div>
  );
};

export default ManageForm;
