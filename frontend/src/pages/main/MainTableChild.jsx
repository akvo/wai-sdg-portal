import React, { useState } from "react";
import { Button, Table } from "antd";
import { FieldTimeOutlined } from "@ant-design/icons";
import MainEditor from "./MainEditor";

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

const NormalCol = ({ value, question, edited }) => {
  return value;
};

const MainTableChild = ({ questionGroup, data }) => {
  const [edited, setEdited] = useState({});
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
    const source = g.question.map((q, qi) => ({
      name: (
        <NormalCol value={<div>{q.name}</div>} question={q} edited={edited} />
      ),
      value: (
        <MainEditor
          value={data.detail.find((d) => d.question === q.id)?.value || null}
          question={q}
          edited={edited}
          setEdited={setEdited}
        />
      ),
      action: (
        <NormalCol
          value={<Button size="small" icon={<FieldTimeOutlined />} />}
          question={q}
          edited={edited}
        />
      ),
      key: qi,
    }));
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
