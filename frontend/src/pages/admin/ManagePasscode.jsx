import React, { useState, useCallback, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  notification,
  Tooltip,
  Button,
  Space,
} from 'antd';
import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../util/api';

const { notificationText } = window.i18n;

const EditableCell = ({
  editing,
  dataIndex,
  inputType,
  record,
  children,
  cancel,
  save,
  loading,
  ...restProps
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputNode =
    inputType === 'number' ? (
      <InputNumber />
    ) : (
      <Space
        size="small"
        direction="horizontal"
        style={{ width: '100%' }}
        className="passcode-wrapper"
      >
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: '',
            },
            {
              pattern: /^(?!.* )(?=.*\d)(?=.*[A-Z]).{8,}$/,
              message: (
                <Tooltip
                  visible={true}
                  color="red"
                  placement="bottom"
                  title="The minimum password length is 8 charachters and must contain at least 1 capital letter 1 number"
                />
              ),
            },
          ]}
        >
          <Input.Password
            visibilityToggle={{
              visible: passwordVisible,
              onVisibleChange: setPasswordVisible,
            }}
          />
        </Form.Item>
        <Button
          type="primary"
          style={{ width: 80 }}
          onClick={() => save(record.id)}
          loading={loading}
        >
          Save
        </Button>
        <Popconfirm
          title="Sure to cancel?"
          onConfirm={cancel}
        >
          <Button
            shape="circle"
            icon={<CloseOutlined />}
          />
        </Popconfirm>
      </Space>
    );
  return <td {...restProps}>{editing ? <>{inputNode}</> : children}</td>;
};

const ManagePasscode = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginate, setPaginate] = useState({
    total: 1,
    current: 1,
    pageSize: 10,
  });
  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    setLoading(true);
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
      api
        .put(`/form/${key}?passcode=${row?.passcode}`)
        .then(() => {
          notification.success({
            message: notificationText?.updateSuccessText,
          });
          getData();
        })
        .catch(() => {
          notification.error({
            message: notificationText?.errorText,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (errInfo) {
      setLoading(false);
    }
  };

  const getData = useCallback((pageSize = 10) => {
    setTableLoading(true);
    api
      .get(`/form/`)
      .then((res) => {
        setData(res.data);
        setPaginate({
          current: res.data.current,
          total: res.data.total,
          pageSize: pageSize,
        });
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => {
        setTableLoading(false);
      });
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = [
    {
      title: 'Form Name',
      dataIndex: 'name',
      width: '20%',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      width: '35%',
      render: (val) => {
        return (
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 200px)' }}
              defaultValue={val}
              readOnly
            />
            <Tooltip title="copy form url">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(val);
                }}
                icon={<CopyOutlined />}
              />
            </Tooltip>
          </Input.Group>
        );
      },
    },
    {
      title: 'Passcode',
      dataIndex: 'passcode',
      width: '25%',
      editable: true,
      render: (val, record) => {
        return (
          <>
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 200px)' }}
                defaultValue={val}
                type="password"
                readOnly
                disabled
              />
              <Popconfirm
                disabled={editingKey !== ''}
                title={
                  <>
                    All current data collection will be effected if you change
                    the form passcode.
                    <br /> All data collectors will need to be informed about
                    the new passcode. <br /> Do you still want to edit the
                    passcode?
                  </>
                }
                okText="Yes"
                cancelText="No"
                onConfirm={() => edit(record)}
              >
                <Button type="primary">Edit Passcode</Button>
              </Popconfirm>
            </Input.Group>
          </>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        cancel,
        save,
        loading,
      }),
    };
  });

  return (
    <Form
      form={form}
      component={false}
    >
      <div className="table-wrapper">
        <Table
          rowKey={(record) => record.id}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={data}
          loading={tableLoading}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            current: paginate.current,
            total: paginate.total,
            onChange: cancel,
            showSizeChanger: false,
          }}
        />
      </div>
    </Form>
  );
};
export default ManagePasscode;
