const mapValues = (d) => {
  return d.columns.filter((x) => !isNaN(x.dataIndex)).map((x) => x.dataIndex);
};

const water = {
  title: "Water Point",
  columns: [
    { title: "Water Points", dataIndex: "name", key: "name" },
    { title: "Number of Users", dataIndex: 82, key: 82 },
    { title: "Water Source Type", dataIndex: 79, key: 79 },
    { title: "Energy Source", dataIndex: 81, key: 81 },
  ],
  formId: 5,
};

const clts = {
  title: "CLTS",
  columns: [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "ODF Status", dataIndex: 8, key: 8 },
    { title: "Declared", dataIndex: 9, key: 9 },
  ],
  formId: 1,
};

const config = {
  water: {
    ...water,
    values: mapValues(water),
  },
  clts: {
    ...clts,
    values: mapValues(clts),
  },
};

export default config;
