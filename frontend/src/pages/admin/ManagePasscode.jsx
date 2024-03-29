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
import {
  CopyOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import api from '../../util/api';

const { notificationText, buttonText, tableText, confirmationModalText } =
  window.i18n;

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
              min: 5,
              message: (
                <Tooltip
                  visible={true}
                  color="red"
                  placement="bottom"
                  title="Password must be greater than 4 characters."
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
          {buttonText?.btnSave}
        </Button>
        <Button
          onClick={cancel}
          shape="circle"
          icon={<CloseOutlined />}
        />
      </Space>
    );
  return <td {...restProps}>{editing ? <>{inputNode}</> : children}</td>;
};

const ManagePasscode = () => {
  const { managePasscodeTableText } = tableText;
  const { deleteFormText } = confirmationModalText;
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState('');
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
        setData(
          res.data.map((x) => ({
            ...x,
            url: `${window.document.location.origin}${x.url}`,
          }))
        );
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
      title: managePasscodeTableText?.colName,
      dataIndex: 'name',
      width: '20%',
    },
    {
      title: managePasscodeTableText?.colUrl,
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
      title: managePasscodeTableText?.colPasscode,
      dataIndex: 'passcode',
      width: '25%',
      editable: true,
      render: (val, record) => {
        return (
          <>
            <Input.Group compact>
              <Input.Password
                style={{ width: 'calc(100% - 200px)' }}
                defaultValue={val}
                type="password"
                readOnly
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone onClick={() => setPasswordVisible(true)} />
                  ) : (
                    <EyeInvisibleOutlined
                      onClick={() => setPasswordVisible(true)}
                    />
                  )
                }
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
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
                okText={deleteFormText?.btnOkText}
                cancelText={deleteFormText?.btnCancelText}
                onConfirm={() => edit(record)}
              >
                <Button type="primary">{buttonText?.btnPasscode}</Button>
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
