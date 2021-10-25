import React, { useState } from "react";
import { Button, Table } from "antd";
import { FieldTimeOutlined } from "@ant-design/icons";
import MainEditor from "./MainEditor";
import { UIState } from "../../state/ui";

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

const MainTableChild = ({ questionGroup, data }) => {
  const { editedRow } = UIState.useState((e) => e);
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
    {
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (dt) => changeColBackground(dt, edited),
    },
  ];

  return questionGroup.map((g, gi) => {
    const source = g.question.map((q, qi) => {
      const answer = data.detail.find((d) => d.question === q.id);
      return {
        name: (
          <NormalCol value={<div>{q.name}</div>} question={q} edited={edited} />
        ),
        value: (
          <MainEditor
            value={answer?.value || null}
            question={q}
            edited={edited}
            dataPointId={data.key}
          />
        ),
        action: (
          <HistoryCol question={q} edited={edited} history={answer?.history} />
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
      />
    );
  });
};

export default MainTableChild;
