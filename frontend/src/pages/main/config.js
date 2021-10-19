const mapValues = (d) => {
  return d.columns.filter((x) => !isNaN(x.dataIndex)).map((x) => x.dataIndex);
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

const health = {
  title: "Health Facility",
  columns: [
    { title: "Facilty Name", dataIndex: "name", key: "name" },
    { title: "Water", dataIndex: 19, key: 19 },
    { title: "Sanitation", dataIndex: 21, key: 21 },
    { title: "Hygiene", dataIndex: 26, key: 26 },
  ],
  formId: 2,
};

const households = {
  title: "Households",
  columns: [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Water", dataIndex: 35, key: 35 },
    { title: "Sanitation", dataIndex: 39, key: 39 },
    { title: "Hygiene", dataIndex: 44, key: 44 },
  ],
  formId: 3,
};

const schools = {
  title: "Schools Facility",
  columns: [
    { title: "School Name", dataIndex: "name", key: "name" },
    { title: "Water", dataIndex: 56, key: 56 },
    { title: "Sanitation", dataIndex: 61, key: 61 },
    { title: "Hygiene", dataIndex: 67, key: 67 },
  ],
  formId: 4,
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

const config = {
  water: {
    ...water,
    values: mapValues(water),
  },
  clts: {
    ...clts,
    values: mapValues(clts),
  },
  health: {
    ...health,
    values: mapValues(health),
  },
  households: {
    ...households,
    values: mapValues(households),
  },
  schools: {
    ...schools,
    values: mapValues(schools),
  },
};

export default config;
