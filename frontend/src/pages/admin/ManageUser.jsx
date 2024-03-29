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
  const [searchForm] = Form.useForm();
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
  const [preload, setPreload] = useState(true);

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

  const filterObjValues = (values) =>
    Object.fromEntries(Object.entries(values).filter(([_, value]) => value));

  const setSearchParams = useCallback((data) => {
    const values = filterObjValues(data);
    const searchParams = new URLSearchParams();
    const params = query(values);
    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
    return searchParams.toString();
  }, []);

  const onSearch = ({ search, organisation, role }, isPending) => {
    getUsers(isPending, 1, 10, { search, organisation, role });
  };

  const onReset = (fieldName = null) => {
    searchForm.resetFields();
    if (fieldName) {
      searchForm.setFieldValue(fieldName, null);
      const searchValues = searchForm.getFieldsValue(true);
      getUsers(active, 1, 10, {
        ...searchValues,
        [fieldName]: null,
      });
    } else {
      const emptyValues = {
        search: null,
        role: null,
        organisation: null,
      };
      searchForm.setFieldsValue(emptyValues);
      setSearchValue(emptyValues);
      getUsers(active, 1, 10, emptyValues);
    }
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

  const getUsers = useCallback(
    (active, page = 1, pageSize = 10, query = {}) => {
      const params = Object.keys(query).length
        ? `&${setSearchParams(query)}`
        : '';
      setTableLoading(true);
      api
        .get(`/user?active=${active}&page=${page}${params}`)
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
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (preload) {
      setPreload(false);
      getUsers(active, 1, 10, searchValue);
    }
  }, [getUsers, active, searchValue, preload]);

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

  const handleOnCloseUserModal = () => {
    form.resetFields();
    form.setFieldsValue({
      access: [],
      email: null,
      name: null,
      role: null,
      search: null,
      organisation: null,
      manage_form_passcode: null,
    });
    setSelectedValue({});
    setIsUserModalVisible(false);
  };

  const handleOnChecked = (isPending) => {
    setShowPendingUser(isPending);
    const pendingValue = isPending ? 0 : 1;
    getUsers(pendingValue, 1, 10, searchValue);
  };

  const canReset = Object.keys(filterObjValues(searchValue)).length > 0;

  return (
    <>
      <Row
        align="middle"
        className="checkbox-wrapper"
      >
        <Col span={20}>
          <Form
            form={searchForm}
            name="search-form"
            initialValues={searchValue}
            onFinish={(values) => onSearch(values, active)}
            layout="inline"
          >
            <Form.Item
              key="search"
              name="search"
            >
              <Input
                value={searchValue?.search}
                placeholder={`${formText?.formSearchPlaceholder} ${adminText?.lastSubmittedByText} ${formText?.labelName} ${formText?.labelEmail}`}
                onChange={(e) => {
                  searchForm.setFieldsValue({ search: e.target.value });
                  setSearchValue({ ...searchValue, search: e.target.value });
                  if (!e.target.value) {
                    onReset('search');
                  }
                }}
                allowClear
              />
            </Form.Item>
            <UserRole
              style={{ width: '150px' }}
              onRoleChange={(value) => {
                searchForm.setFieldsValue({ role: value });
                setSearchValue({ ...searchValue, role: value });
                if (!value) {
                  onReset('role');
                }
              }}
              selectedValue={searchValue}
            />
            <UserOrganisation
              style={{ width: '200px' }}
              onOrganisationChange={(value) => {
                searchForm.setFieldsValue({ organisation: value });
                setSearchValue({ ...searchValue, organisation: value });
                if (!value) {
                  onReset('organisation');
                }
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
                {formText?.formSearchPlaceholder}
              </Button>
              {canReset && (
                <Button
                  htmlType="button"
                  onClick={() => onReset()}
                  style={{ marginLeft: '10px' }}
                >
                  {buttonText?.btnResetAll}
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
              onClick={() => handleOnChecked(!showPendingUser)}
            >
              {adminText?.checkboxShowPendingUserText}
            </Button>
            <Checkbox
              className="checkbox-input"
              onChange={(e) => handleOnChecked(e.target.checked)}
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
            onClick={handleOnCloseUserModal}
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
        onCancel={handleOnCloseUserModal}
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
                  label={formText?.formPasscodePlaceholder}
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
                      title={formText?.formPasscodeInfoText}
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
        placeholder={`${formText?.formSelectPlaceholder} ${formText?.labelRole}`}
        onChange={onRoleChange}
        value={selectedValue?.role}
        allowClear
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
        placeholder={`${formText?.formSelectPlaceholder} ${formText?.labelOrg}`}
        options={organisations.map((x) => ({
          label: x.name,
          value: x.id,
        }))}
        value={selectedValue?.organisation}
        allowClear
      />
    </Form.Item>
  );
};

export default ManageUser;
