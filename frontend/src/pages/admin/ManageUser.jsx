import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Space,
  Button,
  Checkbox,
  Table,
  notification,
  Tag,
  Form,
  Modal,
  Select,
  Input,
} from 'antd';
import { EditOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../util/api';
import capitalize from 'lodash/capitalize';
import isEmpty from 'lodash/isEmpty';
import { UIState } from '../../state/ui';
import ConfirmationModal from '../../components/ConfirmationModal';

const { notificationText, buttonText, adminText, formText, tableText } =
  window.i18n;

const ManageUser = () => {
  const { manageUserTableText } = tableText;
  const { organisations, administration } = UIState.useState((s) => s);
  const [form] = Form.useForm();
  const [showPendingUser, setShowPendingUser] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [paginate, setPaginate] = useState({
    total: 1,
    current: 1,
    pageSize: 10,
  });
  const [selectedValue, setSelectedValue] = useState({});
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInformUser, setIsInformUser] = useState(false);

  //ConfirmationModal state
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    handleOk: null,
    type: 'default',
  });

  const active = showPendingUser ? 0 : 1;

  const onFinish = (values) => {
    setLoading(true);
    api
      .put(
        `/user/${selectedValue.id}?active=1&role=${values.role}&organisation=${values.organisation}`,
        values.access
      )
      .then((res) => {
        notification.success({
          message: active
            ? isInformUser
              ? notificationText?.emailSentText
              : notificationText?.updateSuccessText
            : notificationText?.userApprovedText,
        });
        getUsers(active, paginate.current);
      })
      .catch((err) => {
        setUsers([]);
        notification.error({
          message: notificationText?.errorText,
        });
      })
      .finally(() => {
        setLoading(false);
        setIsInformUser(false);
        setIsUserModalVisible(false);
      });
  };

  const fetchUserDetail = (id) => {
    api.get(`/user/${id}`).then((res) => {
      setIsUserModalVisible(true);
      const u = {
        ...res.data,
      };
      form.setFieldsValue(u);
      setSelectedValue(u);
    });
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationModal({
      ...confirmationModal,
      visible: false,
    });
  };

  const handleDeleteUser = (prop) => {
    const { id, email } = prop;
    setLoading(id);
    api
      .delete(`/user/${id}`)
      .then((res) => {
        notification.success({
          message: `${email} ${notificationText?.isDeletedText}`,
        });
        getUsers(active);
      })
      .catch((err) => {
        notification.error({
          message: notificationText?.errorText,
        });
      })
      .finally(() => {
        setLoading(false);
        handleCloseConfirmationModal();
      });
  };

  const userColumns = [
    {
      title: manageUserTableText?.colName,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: manageUserTableText?.colEmail,
      dataIndex: 'email',
      key: 'email',
      render: (val, prop) => {
        return !active ? (
          <Space size="small">
            {val}{' '}
            <Tag color={prop.email_verified ? 'green' : 'red'}>
              {prop.email_verified ? 'verified' : 'not verified'}
            </Tag>
          </Space>
        ) : (
          val
        );
      },
    },
    {
      title: manageUserTableText?.colOrg,
      dataIndex: 'organisation',
      key: 'organisation',
      render: (val, prop) => organisations?.find((org) => org.id === val)?.name,
    },
    {
      title: manageUserTableText?.colRole,
      dataIndex: 'role',
      key: 'role',
      render: (val, prop) => capitalize(val),
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      render: (id, prop) => (
        <Space
          size="small"
          align="center"
          wrap={true}
        >
          {active ? (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => fetchUserDetail(id)}
              >
                {buttonText?.btnEdit}
              </Button>
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={() =>
                  setConfirmationModal({
                    visible: true,
                    handleOk: () => handleDeleteUser(prop),
                    type: 'delete-user',
                  })
                }
                loading={loading === id}
                disabled={prop?.role === 'admin'}
              >
                {buttonText?.btnDelete}
              </Button>
            </>
          ) : (
            <Button
              size="small"
              icon={<CheckOutlined />}
              disabled={!prop.email_verified}
              onClick={() => fetchUserDetail(id)}
            >
              {buttonText?.btnApprove}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getUsers = useCallback((active, page = 1, pageSize = 10) => {
    setTableLoading(true);
    api
      .get(`/user?active=${active}&page=${page}`)
      .then((res) => {
        setUsers(res.data?.data);
        setPaginate({
          current: res.data.current,
          total: res.data.total,
          pageSize: pageSize,
        });
      })
      .catch((err) => {
        setUsers([]);
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

  const onRoleChange = (value) => {
    form.setFieldsValue({ role: value });
    setSelectedValue({ ...selectedValue, role: value });
  };

  const onOrganisationChange = (value) => {
    form.setFieldsValue({ organisation: value });
    setSelectedValue({ ...selectedValue, organisation: value });
  };

  const onAccessChange = (value) => {
    form.setFieldsValue({ access: value });
    setSelectedValue({ ...selectedValue, access: value });
  };

  return (
    <>
      <Row
        align="middle"
        className="checkbox-wrapper"
      >
        <Col
          span={24}
          align="end"
        >
          <Space align="center">
            <Button
              className="checkbox-label"
              type="link"
              onClick={() => setShowPendingUser(!showPendingUser)}
            >
              {adminText?.checkboxShowPendingUserText}
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

      <Modal
        title={
          active
            ? adminText?.modalEditUserTitle
            : adminText?.modalApproveUserTitle
        }
        centered
        visible={isUserModalVisible}
        footer={[
          <Button
            key="button-cancel"
            onClick={() => setIsUserModalVisible(false)}
          >
            {buttonText?.btnCancel}
          </Button>,
          active ? (
            <Button
              key="button-inform-user"
              loading={isInformUser}
              onClick={() => {
                setIsInformUser(true);
                form.submit();
              }}
            >
              {buttonText?.btnInformUser}
            </Button>
          ) : (
            ''
          ),
          <Button
            key="button-submit"
            type="primary"
            loading={loading}
            onClick={() => {
              form.submit();
            }}
          >
            {selectedValue?.active
              ? buttonText?.btnConfirmChanges
              : buttonText?.btnApprove}
          </Button>,
        ]}
        onCancel={() => setIsUserModalVisible(false)}
      >
        <Form
          form={form}
          name="user-form"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          initialValues={selectedValue}
          onFinish={onFinish}
        >
          <Form.Item
            key="name"
            label={formText?.labelName}
            name="name"
            valuePropName="name"
          >
            <Input
              value={selectedValue?.name}
              disabled
              bordered={false}
            />
          </Form.Item>

          <Form.Item
            key="email"
            label={formText?.labelEmail}
            name="email"
            valuePropName="email"
          >
            <Input
              value={selectedValue?.email}
              disabled
              bordered={false}
            />
          </Form.Item>

          <Form.Item
            key="role"
            label={formText?.labelRole}
            name="role"
            valuePropName="role"
          >
            <Select
              onChange={onRoleChange}
              value={selectedValue?.role}
            >
              <Select.Option
                key="opt-admin"
                value="admin"
              >
                {formText?.optionRoleAdmin}
              </Select.Option>
              <Select.Option
                key="opt-editor"
                value="editor"
              >
                {formText?.optionRoleEditor}
              </Select.Option>
              <Select.Option
                key="opt-user"
                value="user"
              >
                {formText?.optionRoleUser}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            key="group-form"
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('role') !== 'admin' ? (
                <Form.Item
                  key="access"
                  label={formText?.labelAccess}
                  name="access"
                  valuePropName="access"
                  rules={[
                    {
                      required: true,
                      message: formText?.validationAccessRequiredText,
                    },
                  ]}
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.role !== currentValues.role
                  }
                >
                  <Select
                    mode="multiple"
                    onChange={onAccessChange}
                    value={selectedValue?.access}
                  >
                    {administration
                      .filter((a) => a.parent === null)
                      .map((a, ai) => (
                        <Select.Option
                          key={ai}
                          value={a.id}
                        >
                          {a.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            key="organisation"
            label={formText?.labelOrg}
            name="organisation"
            valuePropName="organisation"
          >
            <Select
              showSearch
              onChange={onOrganisationChange}
              options={organisations.map((x) => ({
                label: x.name,
                value: x.id,
              }))}
              value={selectedValue?.organisation}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ConfirmationModal */}
      <ConfirmationModal
        visible={confirmationModal.visible}
        type={confirmationModal.type}
        onOk={confirmationModal.handleOk}
        onCancel={() => handleCloseConfirmationModal()}
      />
    </>
  );
};

export default ManageUser;
