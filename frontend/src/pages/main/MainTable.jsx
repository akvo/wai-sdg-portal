import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
  Divider,
  Table,
  Space,
  Pagination,
  notification,
} from 'antd';
import { Link } from 'react-router-dom';
import MainTableChild from './MainTableChild';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import { getLuma } from '../../util/color';
import { DataUpdateMessage } from './../../components/Notifications';
import isEmpty from 'lodash/isEmpty';
import intersection from 'lodash/intersection';

const { buttonText, adminText } = window?.i18n;

const getRowClassName = (record, editedRow) => {
  const edited = editedRow?.[record.key];
  if (edited) {
    return 'edited';
  }
  return '';
};

const MainTable = ({
  span = 24,
  scroll = 320,
  current,
  loading,
  data,
  dataSource,
  questionGroup,
  total,
  changePage,
  setPerPage,
  lastSubmitted,
  show,
  page,
}) => {
  const { columns, formId, title } = current;
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState([]);
  const { editedRow, administration, user } = UIState.useState((e) => e);

  // Filter by Access
  const administrationIdsByUserAccess =
    user?.role === 'editor' && !isEmpty(user?.access)
      ? administration
          .filter(
            (adm) =>
              user?.access.includes(adm.id) || user?.access.includes(adm.parent)
          )
          .map((adm) => adm.id)
      : administration.map((adm) => adm.id);

  const saveEdit = () => {
    setSaving(true);
    UIState.update((e) => {
      e.reloadData = false;
    });
    const savedValues = Object.keys(editedRow).map((k, _) => {
      const values = Object.keys(editedRow[k]).map((o, _) => ({
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
        e.historyChart = {};
      });
      UIState.update((e) => {
        e.reloadData = true;
      });
    });
  };

  // Modify column config to add render function
  const modifyColumnRender = current.columns.map((col, idx) => {
    if (current.values.includes(col.key)) {
      return {
        ...col,
        render(text) {
          const textValue = text?.value;
          return {
            props: {
              style: {
                background: text?.color || '',
                color: getLuma(text?.color),
              },
            },
            children: textValue,
          };
        },
      };
    }
    return col;
  });

  if (!show) {
    return null;
  }

  return (
    <div className="container">
      <Row
        align="middle"
        justify="space-between"
        wrap={true}
        className="data-info"
      >
        <Col span={8}>
          <span className="info title">
            {title}
            {` (${total})`}
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
      <Divider />
      <Row className="main-table-container">
        <Col span={span}>
          <Table
            size="small"
            rowClassName={(record) => getRowClassName(record, editedRow)}
            loading={loading}
            columns={modifyColumnRender}
            scroll={{ y: scroll }}
            pagination={false}
            expandable={{
              rowExpandable: (record) => {
                // Enable expand by Access
                const administrationAnswers =
                  [record?.name?.props?.record?.administration] || [];
                const isExpandable = !isEmpty(
                  intersection(
                    administrationIdsByUserAccess,
                    administrationAnswers
                  )
                );
                return isExpandable;
              },
              expandIconColumnIndex: columns.length,
              expandedRowRender: (record) => (
                <MainTableChild
                  questionGroup={questionGroup}
                  data={record}
                  showHistoryChartBtn={true}
                />
              ),
            }}
            expandedRowKeys={expanded}
            onExpand={(expanded, record) => {
              UIState.update((ui) => {
                ui.rowHovered = expanded ? record.key : null;
              });
              setExpanded(expanded ? [record.key] : []);
            }}
            dataSource={data}
          />
        </Col>
      </Row>
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
              size="small"
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
              size="small"
              loading={saving}
              disabled={Object.keys(editedRow).length === 0}
              onClick={saveEdit}
            >
              {buttonText?.btnSaveEdit}
            </Button>
            <Link to={`/form/new-${title.toLowerCase()}/${formId}`}>
              <Button size="small">{buttonText?.btnAddNew}</Button>
            </Link>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default MainTable;
