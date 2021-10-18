import React from "react";
import { Select } from "antd";

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
