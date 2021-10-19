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

export const manageDataColumns = [
  {
    title: "Entry",
    dataIndex: "entry",
    key: "entry",
  },
  {
    title: "Last Updated",
    dataIndex: "last_updated",
    key: "last_updated",
  },
  {
    title: "Region",
    dataIndex: "region",
    key: "region",
  },
  {
    title: "User",
    dataIndex: "user",
    key: "user",
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
  },
];

export const userSources = ["joy", "deden", "galih"].map((x, i) => {
  return {
    key: i + 1,
    name: x.toUpperCase(),
    email: `${x}@akvo.org`,
    organisation: "Akvo",
    role: "admin",
    action: (
      <Space size="small" align="center" wrap={true}>
        <Button type="link">Edit</Button>
        <Button type="link">Delete</Button>
      </Space>
    ),
  };
});

export const userColumns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Organisation",
    dataIndex: "organisation",
    key: "organisation",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
  },
];
