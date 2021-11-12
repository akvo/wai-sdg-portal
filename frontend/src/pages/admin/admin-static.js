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
