import { keyBy } from 'lodash';

const mapColumns = (values) => {
  return values?.columns?.map((col, index) => {
    if (index === 0) {
      col = {
        ...col,
        width: col?.width || '35%',
      };
    }
    return {
      ...col,
      align: col?.align || (index === 0 ? 'left' : 'center'),
      dataIndex: col.key,
      ellipsis: true,
    };
  });
};

const mapValues = (values) => {
  return values?.columns?.slice(1)?.map((val) => {
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

const mapper = Object.keys(window.page_config).map((v) => {
  return {
    name: v,
    ...mapAll(window.page_config[v]),
  };
});

const config = keyBy(mapper, 'name');

export default config;
