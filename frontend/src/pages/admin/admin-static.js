const { manageDataTableText } = window.i18n.tableText;

export const columnNames = [
  { title: manageDataTableText?.colName, key: 'name', width: '20%' },
  {
    title: manageDataTableText?.colAdministration,
    key: 'administration',
    width: '20%',
  },
  {
    title: manageDataTableText?.colCreatedBy,
    key: 'created_by',
    align: 'center',
  },
  { title: manageDataTableText?.colCreated, key: 'created', align: 'center' },
  {
    title: manageDataTableText?.colAction,
    key: 'action',
    align: 'center',
    width: '15%',
  },
].map((x) => ({
  ...x,
  dataIndex: x.key,
  elipsis: true,
}));
