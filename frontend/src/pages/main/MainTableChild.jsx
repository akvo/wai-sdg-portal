import React, { useState, useEffect } from "react";
import { Table, Space } from "antd";
import { LineChartOutlined, HistoryOutlined } from "@ant-design/icons";
import MainEditor from "./MainEditor";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import { getLocationName } from "../../util/utils";
import { titleCase } from "../../util/utils.js";

const { mainTableChildText } = window?.i18n?.tableText;

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

const HistoryTable = ({ record, data }) => {
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    if (historyData === null) {
      let url = `history/${data.key}/${record.name.props.question.id}`;
      api.get(url).then((res) => {
        setHistoryData(res.data.map((x, i) => ({ ...x, key: `history-${i}` })));
      });
    }
  }, [historyData, data, record]);
  return (
    <Table
      columns={[
        {
          title: mainTableChildText?.colValue,
          dataIndex: "value",
          key: "value",
        },
        {
          title: mainTableChildText?.colDate,
          dataIndex: "date",
          key: "date",
          align: "center",
        },
        {
          title: mainTableChildText?.colUser,
          dataIndex: "user",
          key: "user",
          align: "center",
        },
      ]}
      loading={historyData === null}
      pagination={false}
      dataSource={historyData}
    />
  );
};

const MainTableChild = ({ questionGroup, data, size = "small", scroll }) => {
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
          <NormalCol
            value={<div>{titleCase(q.name)}</div>}
            question={q}
            edited={edited}
          />
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
        title={() => <b>{g?.name || ""}</b>}
        className={"main-child-table"}
        size={size}
        scroll={scroll ? { y: scroll } : false}
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
            const { dataPointId, question } = record.value.props;
            let showChartButton = "";
            if (question.type === "number" || question.type === "option") {
              showChartButton = (
                <LineChartOutlined
                  onClick={() => {
                    UIState.update((s) => {
                      s.historyChart = {
                        dataPointId: dataPointId,
                        question: question,
                      };
                    });
                  }}
                />
              );
            }
            if (record.value.props.history) {
              return (
                <Space>
                  {showChartButton}
                  <HistoryOutlined onClick={(e) => onExpand(record, e)} />
                </Space>
              );
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
