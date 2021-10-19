import React from "react";
import { Select, Button, Result, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UIState } from "../state/ui";

const levels = ["Woreda", "Kebele"];

export const SelectLevel = () => {
  const { administration, selectedAdministration } = UIState.useState((s) => s);
  return (
    <Space>
      {selectedAdministration.map((s, si) => {
        const onSelect = (v) => {
          UIState.update((u) => {
            u.selectedAdministration[si + 1] = v;
          });
          UIState.update((u) => {
            u.selectedAdministration = u.selectedAdministration.splice(
              0,
              si + 2
            );
          });
        };
        const list = administration
          .filter((a) => a.parent === s)
          .map((a) => ({
            label: a.name,
            value: a.id,
          }));
        if (list.length) {
          return (
            <Select
              key={si}
              value={selectedAdministration[si + 1]}
              showSearch
              placeholder={`Select ${levels[si]}`}
              options={list}
              optionFilterProp="label"
              onSelect={onSelect}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              className="filter-select"
            />
          );
        }
        return "";
      })}
      <Button
        onClick={() =>
          UIState.update((u) => {
            u.selectedAdministration = [null];
          })
        }
      >
        Remove Filter
      </Button>
    </Space>
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
