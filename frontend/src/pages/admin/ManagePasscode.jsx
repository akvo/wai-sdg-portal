import React, { useState, useCallback, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  notification,
  Typography,
  Tooltip,
  Button,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import api from '../../util/api';

const { notificationText } = window.i18n;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === 'number' ? <InputNumber /> : <Input type="password" />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ManagePasscode = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [paginate, setPaginate] = useState({
    total: 1,
    current: 1,
    pageSize: 10,
  });
  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
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
    } catch (errInfo) {
      notification.error({
        message: notificationText?.errorText,
      });
    }
  };

  const getData = useCallback((active, page = 1, pageSize = 10) => {
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
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={cancel}
            >
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Popconfirm
            disabled={editingKey !== ''}
            title={
              <>
                All current data collection will be effected if you change the
                form passcode.
                <br /> All data collectors will need to be informed about the
                new passcode. <br /> Do you still want to edit the passcode?
              </>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() => edit(record)}
          >
            <a>Edit</a>
          </Popconfirm>
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
            onChange: cancel,
            showSizeChanger: false,
          }}
        />
      </div>
    </Form>
  );
};
export default ManagePasscode;
