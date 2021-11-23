import { titleCase } from "./util/utils.js";

const mapColumns = (values) => {
  return values?.columns?.map((col) => {
    const filters = col?.filters?.map((f) => {
      return {
        text: titleCase(f),
        value: f,
      };
    });
    if (filters) {
      col = {
        ...col,
        filters: filters,
      };
    }
    return {
      ...col,
      dataIndex: col.key,
      ellipsis: true,
    };
  });
};

const mapValues = (values) => {
  return values?.columns
    ?.filter((val) => !isNaN(val.key))
    ?.map((val) => {
      return val.key;
    });
};

const mapAll = (properties) => {
  if (!properties) {
    return false;
  }
  return {
    ...properties,
    columns: mapColumns(properties),
    values: mapValues(properties),
  };
};

const config = {
  water: mapAll(window.page_config?.water),
  clts: mapAll(window.page_config?.clts),
  health: mapAll(window.page_config?.health),
  households: mapAll(window.page_config?.households),
  schools: mapAll(window.page_config?.schools),
};

export default config;
