import React, { useState } from "react";
import { Button, Table } from "antd";
import MainEditor from "./MainEditor";

const childcolumns = [
  { dataIndex: "name", key: "name" },
  { dataIndex: "value", key: "value" },
  { dataIndex: "action", key: "action" },
];

const MainTableChild = ({ question, data }) => {
  const [edited, setEdited] = useState({});
  return question.map((g, gi) => {
    const source = g.question.map((q, qi) => ({
      name: q.name,
      value: (
        <MainEditor
          value={data.detail.find((d) => d.question === q.id)?.value || null}
          question={q}
          edited={edited}
          setEdited={setEdited}
        />
      ),
      action: (
        <div>
          {edited?.[q.id] && <Button type={"link"}>Reset</Button>}
          <Button type={"link"}>History</Button>
        </div>
      ),
      key: qi,
    }));
    return (
      <Table
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