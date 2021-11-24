import { titleCase } from "./util/utils.js";

const mapColumns = (values) => {
  return values?.columns?.map((col, index) => {
    if (index === 0) {
      col = {
        ...col,
        width: "35%",
      };
    }
    return {
      ...col,
      align: col?.align || (index === 0 ? "left" : "center"),
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
