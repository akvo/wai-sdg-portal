import React, { useState, useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Space,
  Divider,
  Button,
  Table,
  Pagination,
  Modal,
  notification,
} from 'antd';
import {
  SaveOutlined,
  EditOutlined,
  UndoOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import takeRight from 'lodash/takeRight';
import { columnNames } from './admin-static';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import { getLocationName, generateAdvanceFilterURL } from '../../util/utils';
import MainTableChild from '../main/MainTableChild.jsx';
import ErrorPage from '../../components/ErrorPage';
import {
  DataUpdateMessage,
  DataDeleteMessage,
} from './../../components/Notifications';
import { SelectLevel, DropdownNavigation } from '../../components/common';
import ConfirmationModal from '../../components/ConfirmationModal';
import AdvanceSearch from '../../components/AdvanceSearch';
import isEmpty from 'lodash/isEmpty';
import without from 'lodash/without';
import union from 'lodash/union';
import xor from 'lodash/xor';
import config from '../../config';

const { notificationText, buttonText, adminText } = window.i18n;

const formIdsFromConfig = Object.keys(window.page_config).map(
  (key) => window.page_config?.[key]?.formId
);

const getRowClassName = (record, editedRow) => {
  const edited = editedRow?.[record.key];
  if (edited) {
    return 'edited';
  }
  return '';
};

const ManageData = ({ handleTabClick }) => {
  const {
    user,
    editedRow,
    reloadData,
    administration,
    selectedAdministration,
    advanceSearchValue,
  } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [dataId, setDataId] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionGroup, setQuestionGroup] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(Object.keys(window.page_config)[0]);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState({ by: '', at: '' });
  const [allForm, setAllForm] = useState([]);

  useEffect(() => {
    api.get('/form/').then((res) => {
      setAllForm(res.data);
    });
  }, []);

  const otherForms = useMemo(() => {
    if (allForm.length) {
      return allForm.filter((d) => !formIdsFromConfig.includes(d.id));
    }
    return [];
  }, [allForm]);

  //ConfirmationModal state
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    handleOk: null,
    type: 'default',
  });

  // { formId: form } only for new form
  const current = config?.[form] || {
    formId: form,
    title: allForm.find((x) => x.id === form)?.name,
  };
  const dataSelected = dataId ? data.find((x) => x.key === dataId) : false;

  const { formId, title } = current;

  const showModal = (id) => {
    setDataId(id);
  };

  const handleOk = () => {
    setDataId(false);
  };

  const handleCancel = () => {
    setDataId(false);
  };

  const changePage = (p) => {
    setPage(p);
    setLoading(true);
  };

  const saveEdit = () => {
    setSaving(true);
    UIState.update((e) => {
      e.reloadData = false;
    });
    const savedValues = Object.keys(editedRow).map((k) => {
      const values = Object.keys(editedRow[k]).map((o) => ({
        question: o,
        value: editedRow[k][o],
      }));
      return { dataId: k, values: values };
    });
    const promises = savedValues.map((saved) => {
      return api.put(`data/${saved.dataId}`, saved.values).then((res) => {
        notification.success({
          message: <DataUpdateMessage id={saved.dataId} />,
        });
        return res.data;
      });
    });
    Promise.all(promises).then(() => {
      setSaving(false);
      UIState.update((e) => {
        e.editedRow = {};
      });
      UIState.update((e) => {
        e.reloadData = true;
      });
    });
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationModal({
      ...confirmationModal,
      visible: false,
    });
  };

  const handleDelete = (value) => {
    UIState.update((e) => {
      e.reloadData = false;
    });
    api
      .delete(`data/${value?.id}`)
      .then((res) => {
        notification.success({ message: <DataDeleteMessage id={value.id} /> });
        UIState.update((e) => {
          e.reloadData = true;
        });
        return res;
      })
      .catch(() => {
        notification.error({ message: notificationText?.errorText });
      })
      .finally(() => {
        handleCloseConfirmationModal();
      });
  };

  const handleBulkDelete = (values) => {
    setDeleting(true);
    UIState.update((e) => {
      e.reloadData = false;
    });
    const ids = values.join('&id=');
    api
      .delete(`data?id=${ids}`)
      .then((res) => {
        setSelectedRow([]);
        notification.success({
          message: notificationText?.bulkDeleteSuccessText,
        });
        UIState.update((e) => {
          e.reloadData = true;
        });
        return res;
      })
      .catch(() => {
        notification.error({ message: notificationText?.errorText });
      })
      .finally(() => {
        handleCloseConfirmationModal();
        setDeleting(false);
      });
  };

  const handleExport = () => {
    setExportLoading(true);
    const adminId = takeRight(selectedAdministration)[0];
    let url = `download/data?form_id=${formId}`;
    if (adminId) {
      url += `&administration=${adminId}`;
    }
    url = generateAdvanceFilterURL(advanceSearchValue, url);
    api
      .get(url)
      .then(() => {
        notification.success({
          message: notificationText?.dataExportCreatedText,
        });
        setExportLoading(false);
        handleTabClick('exports');
      })
      .catch(() => {
        setExportLoading(false);
      });
  };

  const hasSelected = !isEmpty(selectedRow);
  const onSelectTableRow = ({ key }) => {
    selectedRow.includes(key)
      ? setSelectedRow(without(selectedRow, key))
      : setSelectedRow([...selectedRow, key]);
  };

  const onSelectAllTableRow = (isSelected) => {
    const ids = data.filter((x) => !x.disabled).map((x) => x.key);
    if (!isSelected && hasSelected) {
      setSelectedRow(xor(selectedRow, ids));
    }
    if (isSelected && !hasSelected) {
      setSelectedRow(ids);
    }
    if (isSelected && hasSelected) {
      setSelectedRow(union(selectedRow, ids));
    }
  };

  useEffect(() => {
    if (user && formId) {
      setPage(1);
      setPerPage(10);
      api.get(`form/${formId}`).then((d) => {
        setQuestionGroup(d.data.question_group);
        UIState.update((s) => {
          s.editedRow = {};
        });
      });
      setSelectedRow([]);
    }
  }, [user, formId]);

  useEffect(() => {
    if (user && formId && reloadData && administration) {
      setLoading(true);
      const adminId = takeRight(selectedAdministration)[0];
      let url = `data/form/${formId}?page=${page}&perpage=${perPage}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      api
        .get(url)
        .then((d) => {
          const tableData = d.data.data.map((x) => {
            const administrationParent = administration.find(
              (adm) => adm.id === x.administration
            )?.parent;
            const isActionDisabled =
              user?.role === 'editor' &&
              !user?.access.includes(administrationParent);
            return {
              key: x.id,
              name: x.name,
              created: x.updated || x.created,
              created_by: x.updated_by || x.created_by,
              administration: getLocationName(x.administration, administration),
              detail: x.answer,
              disabled: isActionDisabled,
              action: (
                <Space
                  size="small"
                  align="center"
                  wrap={true}
                >
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => showModal(x.id)}
                    disabled={isActionDisabled}
                  >
                    {buttonText?.btnEdit}
                  </Button>
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      setConfirmationModal({
                        visible: true,
                        handleOk: () => handleDelete(x),
                        type: 'delete',
                      })
                    }
                    disabled={isActionDisabled}
                  >
                    {buttonText?.btnDelete}
                  </Button>
                </Space>
              ),
            };
          });
          setData(tableData);
          setTotal(d.data.total);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setTotal(0);
          setLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [
    page,
    perPage,
    user,
    formId,
    reloadData,
    selectedAdministration,
    administration,
    advanceSearchValue,
  ]);

  useEffect(() => {
    if (user && formId) {
      const adminId = takeRight(selectedAdministration)[0];
      let url = `last-submitted?form_id=${formId}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      api
        .get(url)
        .then((res) => {
          setLastSubmitted(res.data);
        })
        .catch(() => {
          setLastSubmitted({ by: '', at: '' });
        });
    }
  }, [user, formId, selectedAdministration, advanceSearchValue]);

  if (!current) {
    return <ErrorPage status={404} />;
  }

  return (
    <>
      <div className="filter-wrapper">
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
          <SelectLevel
            setPage={setPage}
            setSelectedRow={setSelectedRow}
          />
        </Space>
        <Button
          type="primary"
          className="export-filter-button"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={exportLoading}
        >
          {buttonText?.btnExportFilterData}
        </Button>
      </div>
      <AdvanceSearch
        formId={formId}
        questionGroup={questionGroup}
        setPage={setPage}
        setSelectedRow={setSelectedRow}
      />
      <Row
        align="middle"
        justify="space-between"
        wrap={true}
        className="data-info"
      >
        <Col span={8}>
          <span className="info title">
            {total ? `Total: ${total} Submissions` : 'No Data'}
            {hasSelected
              ? `, Selected ${selectedRow.length} datapoint${
                  selectedRow.length > 1 ? 's' : ''
                }`
              : ''}
          </span>
        </Col>
        <Col
          span={16}
          align="end"
        >
          {total ? (
            <div className="info">
              {`${adminText?.lastSubmittedAtText}: ${lastSubmitted.at}`}
              <br />
              {`${adminText?.lastSubmittedByText}: ${lastSubmitted.by}`}
            </div>
          ) : (
            ''
          )}
        </Col>
      </Row>
      <div className="table-wrapper">
        <Table
          size="small"
          rowClassName={(record) => getRowClassName(record, editedRow)}
          loading={loading}
          columns={columnNames}
          scroll={perPage > 10 ? { y: 420 } : false}
          pagination={false}
          dataSource={data}
          rowSelection={{
            selectedRowKeys: selectedRow,
            onSelect: onSelectTableRow,
            onSelectAll: onSelectAllTableRow,
            getCheckboxProps: (record) => ({
              disabled: record?.disabled,
            }),
          }}
        />
        <Divider />
        <Row
          align="middle"
          justify="space-around"
        >
          <Col span={16}>
            {total ? (
              <Pagination
                defaultCurrent={1}
                current={page}
                total={total}
                onShowSizeChange={(e, s) => {
                  setPerPage(s);
                }}
                pageSizeOptions={[10, 20, 50]}
                onChange={changePage}
              />
            ) : (
              ''
            )}
          </Col>
          <Col
            span={8}
            align="right"
          >
            <Space>
              <Button
                loading={saving}
                disabled={Object.keys(editedRow).length === 0}
                onClick={saveEdit}
              >
                {buttonText?.btnSaveChanges}
              </Button>
              <Button
                loading={deleting}
                disabled={!hasSelected}
                onClick={() =>
                  setConfirmationModal({
                    visible: true,
                    handleOk: () => handleBulkDelete(selectedRow),
                    type: 'delete',
                  })
                }
              >
                {buttonText?.btnDeleteSelected}
              </Button>
              <Link to={`/form/new-${title.toLowerCase()}/${formId}`}>
                <Button>{buttonText?.btnAddNew}</Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </div>
      {dataSelected ? (
        <Modal
          key="main-table-child-modal"
          title={dataSelected?.name}
          bodyStyle={{ padding: '0px' }}
          visible={dataSelected}
          className="data-edit-modal"
          centered
          width={640}
          onOk={handleOk}
          okText={
            editedRow?.[dataId]
              ? buttonText?.btnSaveDraft
              : buttonText?.btnClose
          }
          cancelText={buttonText?.btnResetAll}
          cancelButtonProps={{
            icon: <UndoOutlined />,
            type: 'danger',
            style: { float: 'left' },
            disabled: !editedRow?.[dataId],
          }}
          okButtonProps={editedRow?.[dataId] && { icon: <SaveOutlined /> }}
          onCancel={handleCancel}
        >
          <div className="modal-wrapper">
            <MainTableChild
              questionGroup={questionGroup}
              data={dataSelected}
              scroll={400}
            />
          </div>
        </Modal>
      ) : (
        ''
      )}

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

export default ManageData;
