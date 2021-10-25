import React, { useState, useEffect } from "react";
import { Button, Table } from "antd";
import { FieldTimeOutlined, HistoryOutlined } from "@ant-design/icons";
import MainEditor from "./MainEditor";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import { getLocationName } from "../../util/utils";

const changeColBackground = (dt, edited) => {
  if (edited?.[dt.props.question.id]) {
    return {
      props: {
        style: { background: "#fefebe" },
      },
      children: dt,
    };
  }
  return {
    children: dt,
  };
};

const NormalCol = ({ value }) => {
  return value;
};

const HistoryCol = ({ history }) => {
  if (history) {
    return <Button size="small" icon={<FieldTimeOutlined />} />;
  }
  return (
    <Button size="small" type="dashed" icon={<FieldTimeOutlined />} disabled />
  );
};

const HistoryTable = ({ record, data }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    if (historyData === null) {
      let url = `history/${data.key}/${record.name.props.question.id}`;
      api.get(url).then((res) => {
        setHistoryData(res.data.map((x, i) => ({ ...x, key: `history-${i}` })));
      });
    }
  }, [historyData]);
  return (
    <Table
      columns={[
        { title: "History", dataIndex: "value", key: "value" },
        { title: "Updated at", dataIndex: "date", key: "date" },
        { title: "Updated by", dataIndex: "user", key: "user" },
      ]}
      loading={historyData === null}
      pagination={false}
      dataSource={historyData}
    />
  );
};

const MainTableChild = ({ questionGroup, data }) => {
  const { editedRow, administration } = UIState.useState((e) => e);
  const [expanded, setExpanded] = useState([]);
  const edited = editedRow?.[data.key];
  const childcolumns = [
    {
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (dt) => changeColBackground(dt, edited),
    },
    {
      dataIndex: "value",
      key: "value",
      render: (dt) => changeColBackground(dt, edited),
    },
  ];

  return questionGroup.map((g, gi) => {
    const source = g.question.map((q, qi) => {
      const answer = data.detail.find((d) => d.question === q.id);
      const nonEditable = (q.type === "administration") | (q.type === "geo");
      return {
        name: (
          <NormalCol value={<div>{q.name}</div>} question={q} edited={edited} />
        ),
        value: nonEditable ? (
          <NormalCol
            value={
              <div>
                {q.type === "administration" && answer?.value
                  ? getLocationName(answer?.value, administration)
                  : answer?.value}
              </div>
            }
            question={q}
            edited={edited}
          />
        ) : (
          <MainEditor
            value={answer?.value || null}
            question={q}
            edited={edited}
            dataPointId={data.key}
            history={answer?.history}
          />
        ),
        key: qi,
      };
    });
    return (
      <Table
        className={"main-child-table"}
        size="small"
        key={gi}
        showHeader={false}
        columns={childcolumns}
        dataSource={source}
        pagination={false}
        bordered={false}
        expandedRowKeys={expanded}
        onExpand={(expanded, record) => {
          setExpanded(expanded ? [record.key] : []);
        }}
        expandable={{
          expandIconColumnIndex: 3,
          expandIcon: ({ expanded, onExpand, record }) => {
            if (record.value.props.history) {
              return <HistoryOutlined onClick={(e) => onExpand(record, e)} />;
            }
            return "";
          },
          expandedRowRender: (record) => (
            <HistoryTable record={record} data={data} />
          ),
          rowExpandable: (record) => {
            return record.value.props.history;
          },
        }}
      />
    );
  });
};

export default MainTableChild;
