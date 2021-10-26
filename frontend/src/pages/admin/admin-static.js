export const columnNames = [
  { title: "Entry", key: "name", width: "20%" },
  { title: "Region", key: "administration", width: "20%" },
  { title: "Submitter", key: "created_by", align: "center" },
  { title: "Last Updated", key: "created", align: "center" },
  { title: "Action", key: "action", align: "center", width: "15%" },
].map((x) => ({
  ...x,
  dataIndex: x.key,
  elipsis: true,
}));

const config = {
  clts: {
    title: "CLTS",
    formId: 1,
  },
  health: {
    title: "Health",
    formId: 2,
  },
  households: {
    title: "Households",
    formId: 3,
  },
  schools: {
    title: "Schools Facility",
    formId: 4,
  },
  water: {
    title: "Water",
    formId: 5,
  },
};

export default config;
