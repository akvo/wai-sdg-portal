import React from "react";
import { Select, Result } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const SelectFilter = ({ placeholder }) => {
  return (
    <Select
      showSearch
      placeholder={placeholder}
      options={[]}
      optionFilterProp="label"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      className="filter-select"
    />
  );
};

export const Loading = () => {
  return (
    <Result
      className="loading"
      icon={<LoadingOutlined spin />}
      subTitle="Loading"
    />
  );
};
