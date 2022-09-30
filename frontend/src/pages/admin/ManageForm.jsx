import React, { useState } from 'react';
import { Row, Col, Button, Space, Divider, notification, Spin } from 'antd';
import WebformEditor from 'akvo-react-form-editor';
import 'akvo-react-form-editor/dist/index.css';
import { DropdownNavigation } from '../../components/common';
import api from '../../util/api';
import isEmpty from 'lodash/isEmpty';

const { buttonText } = window.i18n;

const defaultQuestion = {
  type: 'text',
  name: 'New Question',
  required: true,
};

const ManageForm = () => {
  const [form, setForm] = useState(null);
  const [initialValue, setInitialValue] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { formId } = form ? window.page_config[form] : {};

  const loadForm = () => {
    setIsLoading(true);
    api.get(`/webform/${formId}?edit=true`).then((res) => {
      setInitialValue(res.data);
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    });
  };

  const onSaveForm = (values) => {
    // if initialValue defined => edit
    if (formId && !isEmpty(initialValue)) {
      api
        .put(`/webform/${formId}`, values)
        .then((res) => {
          setInitialValue(res.data);
          notification.success({
            message: 'Form updated successfully',
          });
        })
        .catch(() =>
          notification.success({
            message: 'Oops, something went wrong',
          })
        );
    }
  };

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
              <Button
                onClick={loadForm}
                disabled={!form}
              >
                {buttonText?.btnEdit}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      <Divider />
      {isLoading && (
        <div className="loading">
          <Spin />
        </div>
      )}
      <div
        style={{
          visibility:
            !isEmpty(initialValue) && !isLoading ? 'visible' : 'hidden',
        }}
      >
        <WebformEditor
          onSave={onSaveForm}
          initialValue={initialValue}
          defaultQuestion={defaultQuestion}
          limitQuestionType={[
            'text',
            'number',
            'option',
            'multiple_option',
            'date',
            'geo',
            'cascade',
          ]}
          settingCascadeURL={[
            {
              id: 1,
              name: 'administration',
              endpoint: '/api/administration',
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ManageForm;
