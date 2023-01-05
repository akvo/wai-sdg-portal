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
  Empty,
  Switch,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import api from '../../util/api';
import { query } from '../../util/utils';
import capitalize from 'lodash/capitalize';
import isEmpty from 'lodash/isEmpty';
import { UIState } from '../../state/ui';
import ConfirmationModal from '../../components/ConfirmationModal';

const { notificationText, buttonText, adminText, formText, tableText } =
  window.i18n;

const ManageUser = () => {
  const { manageUserTableText } = tableText;
  const { organisations, administration, user } = UIState.useState((s) => s);
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
  const [searchValue, setSearchValue] = useState({});
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
        `/user/${selectedValue.id}?active=1&role=${values.role}&organisation=${
          values.organisation
        }${
          values.manage_form_passcode
            ? `&manage_form_passcode=${values.manage_form_passcode}`
            : ''
        }`,
        values.access
      )
      .then(() => {
        notification.success({
          message: active
            ? isInformUser
              ? notificationText?.emailSentText
              : notificationText?.updateSuccessText
            : notificationText?.userApprovedText,
        });
        getUsers(active, paginate.current);
      })
      .catch(() => {
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

  const onSearch = (values) => {
    const searchParams = new URLSearchParams();
    const params = query(values);
    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
    getUsers(active, 1, 10, searchParams.toString());
  };

  const onReset = () => {
    form.resetFields();
    form.setFieldsValue({ search: '' });
    setSearchValue({});
    getUsers(active);
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
      .then(() => {
        notification.success({
          message: `${email} ${notificationText?.isDeletedText}`,
        });
        getUsers(active);
      })
      .catch(() => {
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
      render: (val) => organisations?.find((org) => org.id === val)?.name,
    },
    {
      title: manageUserTableText?.colRole,
      dataIndex: 'role',
      key: 'role',
      render: (val) => capitalize(val),
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

  const getUsers = useCallback((active, page = 1, pageSize = 10, query) => {
    setTableLoading(true);
    api
      .get(`/user?active=${active}&page=${page}${query ? `&${query}` : ''}`)
      .then((res) => {
        setUsers(res.data?.data);
        setPaginate({
          current: res.data.current,
          total: res.data.total,
          pageSize: pageSize,
        });
      })
      .catch(() => {
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

  const locale = {
    emptyText: (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span>No User Found</span>}
      />
    ),
  };

  const onPasscodeChange = (value) => {
    form.setFieldsValue({ manage_form_passcode: value });
    setSelectedValue({ ...selectedValue, manage_form_passcode: value });
  };

  return (
    <>
      <Row
        align="middle"
        className="checkbox-wrapper"
      >
        <Col span={20}>
          <Form
            form={form}
            name="search-form"
            initialValues={searchValue}
            onFinish={onSearch}
            layout="inline"
          >
            <Form.Item
              key="search"
              name="search"
            >
              <Input
                value={searchValue?.search}
                placeholder="Search by Name, Email"
                onChange={(e) => {
                  form.setFieldsValue({ search: e.target.value });
                  setSearchValue({ ...searchValue, search: e.target.value });
                }}
              />
            </Form.Item>
            <UserRole
              style={{ width: '150px' }}
              onRoleChange={(value) => {
                form.setFieldsValue({ role: value });
                setSearchValue({ ...searchValue, role: value });
              }}
              selectedValue={searchValue}
            />
            <UserOrganisation
              style={{ width: '200px' }}
              onOrganisationChange={(value) => {
                form.setFieldsValue({ organisation: value });
                setSearchValue({ ...searchValue, organisation: value });
              }}
              selectedValue={searchValue}
              organisations={organisations}
            />
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={Object.values(searchValue).every(
                  (x) => x === '' || x === null || typeof x === 'undefined'
                )}
              >
                Search
              </Button>
              {Object.values(searchValue).length > 0 &&
                Object.values(searchValue).every(
                  (x) => typeof x !== 'undefined'
                ) && (
                  <Button
                    htmlType="button"
                    onClick={onReset}
                    style={{ marginLeft: '10px' }}
                  >
                    Reset
                  </Button>
                )}
            </Form.Item>
          </Form>
        </Col>
        <Col
          span={4}
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
          locale={locale}
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

          <UserRole
            onRoleChange={onRoleChange}
            selectedValue={selectedValue}
            label
          />

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

          <Form.Item
            key="passcode-form"
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('role') === 'admin' ? (
                <Form.Item
                  key="manage_form_passcode"
                  label="Manage Form Passcode"
                  valuePropName="manage_form_passcode"
                  name="manage_form_passcode"
                  className="passcode-item"
                >
                  <Switch
                    onChange={onPasscodeChange}
                    checked={selectedValue?.manage_form_passcode}
                    disabled={!user?.manage_form_passcode}
                  />
                  {!user?.manage_form_passcode && (
                    <Tooltip
                      placement="top"
                      title="This feature can only be enabled by users with form passcode management permission"
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  )}
                </Form.Item>
              ) : null
            }
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

const UserRole = ({ onRoleChange, selectedValue, label, style }) => {
  return (
    <Form.Item
      key="role"
      label={label ? formText?.labelRole : ''}
      name="role"
      valuePropName="role"
    >
      <Select
        style={style}
        placeholder="Select role"
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
  );
};

const UserOrganisation = ({
  onOrganisationChange,
  selectedValue,
  label,
  organisations,
  style,
}) => {
  return (
    <Form.Item
      key="organisation"
      label={label ? formText?.labelOrg : ''}
      name="organisation"
      valuePropName="organisation"
    >
      <Select
        style={style}
        showSearch
        onChange={onOrganisationChange}
        placeholder="Select organisation"
        options={organisations.map((x) => ({
          label: x.name,
          value: x.id,
        }))}
        value={selectedValue?.organisation}
      />
    </Form.Item>
  );
};

export default ManageUser;
