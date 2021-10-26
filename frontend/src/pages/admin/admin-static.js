import React from "react";
import { Space, Button } from "antd";

export const manageDataSources = ["Facility 1", "Facility 2", "Facility 3"].map(
  (x, i) => {
    return {
      key: i + 1,
      entry: x,
      last_updated: "Saturday 17 November 2021",
      region: "Arsi Negele",
      user: "akvo user",
      action: (
        <Space size="small" align="center" wrap={true}>
          <Button type="link">Edit</Button>
          <Button type="link">Delete</Button>
        </Space>
      ),
    };
  }
);

export const columnNames = [
  { title: "Entry", key: "name", width: "20%" },
  { title: "Region", key: "administration", width: "20%" },
  { title: "Submitter", key: "created_by", align: "center" },
  { title: "Last Updated", key: "created", align: "center" },
].map((x) => ({
  ...x,
  dataIndex: x.key,
  elipsis: true,
}));

const config = {
  clts: {
    title: "CLTS",
    formId: 1,
  },
  health: {
    title: "Health",
    formId: 2,
  },
  households: {
    title: "Households",
    formId: 3,
  },
  schools: {
    title: "Schools Facility",
    formId: 4,
  },
  water: {
    title: "Water",
    formId: 5,
  },
};

export default config;
