const water = {
  title: "Water Point",
  table: [
    { title: "Water Points", dataIndex: "name", key: "name" },
    { title: "Number of Users", dataIndex: 82, key: 82 },
    { title: "Water Source Type", dataIndex: 79, key: 79 },
    { title: "Energy Source", dataIndex: 81, key: 81 },
  ],
  formId: 5,
};

const config = {
  water: {
    ...water,
    values: water.table
      .filter((x) => !isNaN(x.dataIndex))
      .map((x) => x.dataIndex),
  },
};

export default config;
