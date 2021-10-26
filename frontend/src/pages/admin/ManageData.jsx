import React, { useState, useEffect } from "react";
import { Row, Col, Space, Divider, Button, Table, Pagination } from "antd";
import { SelectLevel, DropdownNavigation } from "../../components/common";
import config, { columnNames, manageDataSources } from "./admin-static";
import { UIState } from "../../state/ui";
import takeRight from "lodash/takeRight";
import ErrorPage from "../../components/ErrorPage";
import api from "../../util/api";
import { getLocationName } from "../../util/utils";

const getRowClassName = (record, editedRow) => {
  const edited = editedRow?.[record.key];
  if (edited) {
    return "edited";
  }
  return "";
};

const ManageData = () => {
  const {
    user,
    editedRow,
    reloadData,
    administration,
    selectedAdministration,
  } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [questionGroup, setQuestionGroup] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState("water");
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const current = config?.[form];
  const { formId } = current;

  const changePage = (p) => {
    setPage(p);
    setLoading(true);
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
    }
  }, [user, formId]);

  useEffect(() => {
    if (user && formId && reloadData) {
      const adminId = takeRight(selectedAdministration)[0];
      setLoading(true);
      let url = `data/form/${formId}?page=${page}&perpage=${perPage}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      api
        .get(url)
        .then((d) => {
          const tableData = d.data.data.map((x) => {
            return {
              key: x.id,
              name: x.name,
              created: x.updated || x.created,
              created_by: x.updated_by || x.created_by,
              administration: getLocationName(x.administration, administration),
              detail: x.answer,
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
  }, [page, perPage, user, formId, reloadData, selectedAdministration]);

  if (!current) {
    return <ErrorPage status={404} />;
  }
  return (
    <>
      <div className="filter-wrapper">
        <Space size={20} align="center" wrap={true}>
          <DropdownNavigation value={form} onChange={setForm} />
          <SelectLevel />
        </Space>
      </div>
      <Row
        className="button-wrapper"
        align="middle"
        justify="space-between"
        wrap={true}
      >
        <Col span={24} align="end">
          <Button type="primary" className="export-filter-button">
            Export Filtered Data
          </Button>
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
        />
        <Divider />
        {total ? (
          <Pagination
            defaultCurrent={1}
            total={total}
            onShowSizeChange={(e, s) => {
              setPerPage(s);
            }}
            pageSizeOptions={[10, 20, 50]}
            onChange={changePage}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ManageData;
