const mapValues = (d) => {
  return d.columns.filter((x) => !isNaN(x.key)).map((x) => x.key);
};

const mapConfig = (h) => {
  return {
    ...h,
    values: mapValues(h),
    columns: h.columns.map((c) => ({
      ...c,
      dataIndex: c.key,
      ellipsis: true,
    })),
  };
};

const clts = {
  title: "CLTS",
  columns: [
    { title: "Name", key: "name", width: "30%" },
    { title: "ODF Status", key: 8 },
    { title: "Declared", key: 9 },
  ],
  formId: 1,
};

const health = {
  title: "Health Facility",
  columns: [
    { title: "Facilty Name", key: "name", width: "30%" },
    { title: "Water", key: 19 },
    { title: "Sanitation", key: 21 },
    { title: "Hygiene", key: 26 },
  ],
  formId: 2,
};

const households = {
  title: "Households",
  columns: [
    { title: "Name", key: "name", width: "30%" },
    { title: "Water", key: 35 },
    { title: "Sanitation", key: 39 },
    { title: "Hygiene", key: 44 },
  ],
  formId: 3,
};

const schools = {
  title: "Schools Facility",
  columns: [
    { title: "School Name", key: "name", width: "30%" },
    { title: "Water", key: 56 },
    { title: "Sanitation", key: 61 },
    { title: "Hygiene", key: 67 },
  ],
  formId: 4,
};

const water = {
  title: "Water Point",
  columns: [
    { title: "Water Points", key: "name", width: "30%" },
    { title: "Number of Users", key: 82 },
    { title: "Water Source Type", key: 79 },
    { title: "Energy Source", key: 81 },
  ],
  formId: 5,
};

const config = {
  water: mapConfig(water),
  clts: mapConfig(clts),
  health: mapConfig(health),
  households: mapConfig(households),
  schools: mapConfig(schools),
};

export default config;
