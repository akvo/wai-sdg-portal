import React, { useState, useEffect, useCallback } from "react";
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
} from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import api from "../../util/api";
import capitalize from "lodash/capitalize";
import isEmpty from "lodash/isEmpty";
import { UIState } from "../../state/ui";

const ManageUser = () => {
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

  const active = showPendingUser ? 0 : 1;

  const onFinish = (values) => {
    api
      .put(
        `/user/${selectedValue.id}?active=1&role=${values.role}&organisation=${values.organisation}`,
        values.access
      )
      .then((res) => {
        notification.success({
          message: active
            ? isInformUser
              ? "Email has been sent"
              : "Update process has been applied"
            : "User approved",
        });
        getUsers(active, paginate.current);
      })
      .catch((err) => {
        console.error(err);
        setUsers([]);
        notification.error({
          message: "Ops, something went wrong",
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

  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (val, prop) => {
        return !active ? (
          <Space size="small">
            {val}{" "}
            <Tag color={prop.email_verified ? "green" : "red"}>
              {prop.email_verified ? "verified" : "not verified"}
            </Tag>
          </Space>
        ) : (
          val
        );
      },
    },
    {
      title: "Organisation",
      dataIndex: "organisation",
      key: "organisation",
      render: (val, prop) => organisations?.find((org) => org.id === val)?.name,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (val, prop) => capitalize(val),
    },
    {
      title: "",
      dataIndex: "id",
      key: "id",
      render: (id, prop) => (
        <Space size="small" align="center" wrap={true}>
          {active ? (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => fetchUserDetail(id)}
            >
              Edit
            </Button>
          ) : (
            <Button
              size="small"
              icon={<CheckOutlined />}
              disabled={!prop.email_verified}
              onClick={() => fetchUserDetail(id)}
            >
              Approve
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
        console.error(err);
        setUsers([]);
        notification.error({
          message: "Ops, something went wrong",
        });
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
      <Row align="middle" className="checkbox-wrapper">
        <Col span={24} align="end">
          <Space align="center">
            <Button
              className="checkbox-label"
              type="link"
              onClick={() => setShowPendingUser(!showPendingUser)}
            >
              Show Pending Users
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
        title={`${active ? "Edit" : "Approve"} User`}
        centered
        visible={isUserModalVisible}
        footer={[
          <Button onClick={() => setIsUserModalVisible(false)}>Cancel</Button>,
          active ? (
            <Button
              loading={isInformUser}
              onClick={() => {
                setIsInformUser(true);
                form.submit();
              }}
            >
              Inform User
            </Button>
          ) : (
            ""
          ),
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              setLoading(true);
              form.submit();
            }}
          >
            {selectedValue?.active ? "Confirm Changes" : "Approve"}
          </Button>,
        ]}
        onCancel={() => setIsUserModalVisible(false)}
      >
        <Form
          form={form}
          name="user-form"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          initialValue={selectedValue}
          onFinish={onFinish}
        >
          <Form.Item label="Name" name="name" valuePropName="name">
            <Input value={selectedValue?.name} disabled bordered={false} />
          </Form.Item>

          <Form.Item label="Email" name="email" valuePropName="email">
            <Input value={selectedValue?.email} disabled bordered={false} />
          </Form.Item>

          <Form.Item label="Role" name="role" valuePropName="role">
            <Select onChange={onRoleChange} value={selectedValue?.role}>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="editor">Editor</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("role") !== "admin" ? (
                <Form.Item
                  label="Access"
                  name="access"
                  valuePropName="access"
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
                        <Select.Option key={ai} value={a.id}>
                          {a.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            label="Organisation"
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
    </>
  );
};

export default ManageUser;
