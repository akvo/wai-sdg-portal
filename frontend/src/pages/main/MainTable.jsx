import React, { useState } from "react";
import {
  Row,
  Col,
  Button,
  Divider,
  Table,
  Space,
  Pagination,
  notification,
} from "antd";
import { Link } from "react-router-dom";
import MainTableChild from "./MainTableChild";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import { DataUpdateMessage } from "./../../components/Notifications";

const getRowClassName = (record, editedRow) => {
  const edited = editedRow?.[record.key];
  if (edited) {
    return "edited";
  }
  return "";
};

const MainTable = ({
  current,
  loading,
  data,
  questionGroup,
  total,
  changePage,
  setPerPage,
  lastSubmitted,
}) => {
  const { columns, formId, title } = current;
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState([]);
  const { editedRow } = UIState.useState((e) => e);
  const saveEdit = () => {
    setSaving(true);
    UIState.update((e) => {
      e.reloadData = false;
    });
    const savedValues = Object.keys(editedRow).map((k, v) => {
      const values = Object.keys(editedRow[k]).map((o, v) => ({
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
  return (
    <Col span={12} className="table-wrapper">
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
          <Col span={16} align="end">
            {total ? (
              <div className="info">
                Last submitted: {lastSubmitted.at}
                <br />
                by: {lastSubmitted.by}
              </div>
            ) : (
              ""
            )}
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={24}>
            <Table
              size="small"
              rowClassName={(record) => getRowClassName(record, editedRow)}
              loading={loading}
              columns={columns}
              scroll={{ y: 320 }}
              pagination={false}
              expandable={{
                expandIconColumnIndex: columns.length,
                expandedRowRender: (record) => (
                  <MainTableChild questionGroup={questionGroup} data={record} />
                ),
              }}
              expandedRowKeys={expanded}
              onExpand={(expanded, record) => {
                setExpanded(expanded ? [record.key] : []);
              }}
              dataSource={data}
            />
          </Col>
        </Row>
        <Divider />
        <Row align="middle" justify="space-around">
          <Col span={16}>
            {total ? (
              <Pagination
                defaultCurrent={1}
                total={total}
                size="small"
                onShowSizeChange={(e, s) => {
                  setPerPage(s);
                }}
                pageSizeOptions={[10, 20, 50]}
                onChange={changePage}
              />
            ) : (
              ""
            )}
          </Col>
          <Col span={8}>
            <Space>
              <Button
                size="small"
                loading={saving}
                disabled={Object.keys(editedRow).length === 0}
                onClick={saveEdit}
              >
                Save Edit
              </Button>
              <Link to={`/form/new-${title.toLowerCase()}/${formId}`}>
                <Button size="small">Add New</Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default MainTable;
