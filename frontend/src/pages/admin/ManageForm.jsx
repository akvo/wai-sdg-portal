import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Button, Space, Divider, notification, Spin } from 'antd';
import WebformEditor from 'akvo-react-form-editor';
import 'akvo-react-form-editor/dist/index.css';
import { DropdownNavigation } from '../../components/common';
import api from '../../util/api';
import isEmpty from 'lodash/isEmpty';

const { buttonText } = window.i18n;
const { allowEdit, allowAddNew } = window.features.formFeature;

const formIdsFromConfig = Object.keys(window.page_config).map(
  (key) => window.page_config?.[key]?.formId
);

const defaultQuestion = {
  type: 'text',
  name: 'New Question',
  required: true,
};

const ManageForm = () => {
  const [form, setForm] = useState(null);
  const [initialValue, setInitialValue] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAddNew, setIsAddNew] = useState(false);
  const [otherForms, setOtherForms] = useState([]);

  const formId = useMemo(() => {
    const { formId: currentFormId } = form
      ? window.page_config?.[form] || { formId: form } // { formId: form } only for new form
      : {};
    return currentFormId;
  }, [form]);

  const loadOtherForms = useCallback(() => {
    // get form from add new feature
    api.get('/form/').then((res) => {
      setOtherForms(res.data.filter((d) => !formIdsFromConfig.includes(d.id)));
    });
  }, []);

  useEffect(() => {
    loadOtherForms();
  }, [loadOtherForms]);

  const loadForm = () => {
    setIsAddNew(false);
    setIsLoading(true);
    api.get(`/webform/${formId}?edit=true`).then((res) => {
      setInitialValue(res.data);
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    });
  };

  const handleAddNew = () => {
    setInitialValue({});
    setIsLoading(true);
    setForm(null);
    setIsAddNew(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
    // handle post
    if (isAddNew && !formId) {
      api
        .post('/webform/', values)
        .then((res) => {
          setInitialValue(res.data);
          setTimeout(() => {
            loadOtherForms();
            setForm(res.data.id);
          }, 500);
          notification.success({
            message: 'Form saved successfully',
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
                otherForms={otherForms}
              />
              {allowEdit && (
                <Button
                  onClick={loadForm}
                  disabled={!form}
                >
                  {buttonText?.btnEdit}
                </Button>
              )}
              {allowAddNew && (
                <Button onClick={handleAddNew}>{buttonText?.btnAddNew}</Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>
      <Divider />
      <div>
        {isLoading && (
          <div className="loading">
            <Spin />
          </div>
        )}
        <div
          style={{
            visibility:
              (!isEmpty(initialValue) && formId) || isAddNew
                ? 'visible'
                : 'hidden',
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
    </div>
  );
};

export default ManageForm;
