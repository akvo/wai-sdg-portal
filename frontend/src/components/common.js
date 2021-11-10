import React from "react";
import { Select, Button, Result, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UIState } from "../state/ui";

const { Option, OptGroup } = Select;

const levels = ["Woreda", "Kebele"];

export const navigationOptions = [
  {
    link: "water",
    name: "Water",
    childrens: null,
  },
  {
    link: "clts",
    name: "CLTS",
    childrens: null,
  },
  {
    link: "jmp",
    name: "JMP",
    childrens: [
      {
        link: "households",
        name: "Households",
      },
      {
        link: "schools",
        name: "Schools",
      },
      {
        link: "health",
        name: "Health Facilities",
      },
    ],
  },
];

export const SelectLevel = ({ setPage, setSelectedRow }) => {
  const { selectedAdministration, administrationByAccess } = UIState.useState(
    (s) => s
  );
  return (
    <Space>
      {selectedAdministration.map((s, si) => {
        const onSelect = (v) => {
          setPage(1);
          if (setSelectedRow) {
            setSelectedRow([]);
          }
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
        const list = administrationByAccess
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
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              className="filter-select"
            />
          );
        }
        return "";
      })}
      <Button
        onClick={() => {
          setPage(1);
          if (setSelectedRow) {
            setSelectedRow([]);
          }
          UIState.update((u) => {
            u.selectedAdministration = [null];
          });
        }}
      >
        Remove Filter
      </Button>
    </Space>
  );
};

export const DropdownNavigation = ({ value, onChange }) => {
  return (
    <Select value={[value]} onChange={onChange} className="filter-select">
      {navigationOptions.map((item, i) => {
        return item.childrens ? (
          <OptGroup label={item.name} key={`${item.link}-${i}`}>
            {item?.childrens?.map((child) => (
              <Option value={child.link} key={`${child.link}-${i}`}>
                {child.name}
              </Option>
            ))}
          </OptGroup>
        ) : (
          <Option value={item.link} key={`${item.link}-${i}`}>
            {item.name}
          </Option>
        );
      })}
    </Select>
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
