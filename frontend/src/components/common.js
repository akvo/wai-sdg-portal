import React from 'react';
import { Select, Button, Result, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { UIState } from '../state/ui';

const navigationOptions = window.navigation_config;
const levels = window.levels;
const { Option, OptGroup } = Select;

const { buttonText, mainText, notificationText } = window.i18n;
const { allowAddNew: allowAddNewForm } = window.features.formFeature;

export const SelectLevel = ({ setPage, setSelectedRow }) => {
  const { selectedAdministration, administrationByAccess, user } =
    UIState.useState((s) => s);
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
              placeholder={`${mainText?.mainSelectPlaceholder} ${levels[si]}`}
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
        return '';
      })}
      <Button
        className="remove-filter-button"
        onClick={() => {
          setPage(1);
          if (setSelectedRow) {
            setSelectedRow([]);
          }
          const selectedAdministration =
            user?.role === 'admin' || user?.access?.length > 1
              ? [null]
              : [null, user?.access?.[0]];
          UIState.update((u) => {
            u.selectedAdministration = selectedAdministration;
          });
        }}
      >
        {buttonText?.btnRemoveFilter}
      </Button>
    </Space>
  );
};

export const DropdownNavigation = ({ value, onChange, otherForms = [] }) => {
  return (
    <Select
      value={[value]}
      onChange={onChange}
      className="filter-select"
      placeholder="Select Form"
    >
      {navigationOptions.map((item, i) => {
        return item.childrens ? (
          <OptGroup
            label={item.name}
            key={`${item.link}-${i}`}
          >
            {item?.childrens?.map((child) => (
              <Option
                value={child.link}
                key={`${child.link}-${i}`}
              >
                {child.name}
              </Option>
            ))}
          </OptGroup>
        ) : (
          <Option
            value={item.link}
            key={`${item.link}-${i}`}
          >
            {item.name}
          </Option>
        );
      })}
      {allowAddNewForm && otherForms.length && (
        <OptGroup
          label="Other Forms"
          key={`other-forms`}
        >
          {otherForms.map((form) => (
            <Option
              value={form.id}
              key={`${form.id}`}
            >
              {form.name}
            </Option>
          ))}
        </OptGroup>
      )}
    </Select>
  );
};

export const Loading = () => {
  return (
    <Result
      className="loading"
      icon={<LoadingOutlined spin />}
      subTitle={notificationText?.loadingText}
    />
  );
};
