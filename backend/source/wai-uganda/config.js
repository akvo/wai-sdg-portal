var site_name = "WAI Uganda";
var navigation_config = [
  {
    link: "water",
    name: "Water",
    childrens: null,
  },
  {
    link: "jmp",
    name: "JMP",
    childrens: [
      {
        link: "households",
        name: "Households",
      },
      {
        link: "schools",
        name: "Schools",
      },
      {
        link: "health",
        name: "Health Facilities",
      },
    ],
  },
];

var page_config = {
  water: {
    title: "Water Point",
    columns: [
      {
        title: "Water Points",
        key: "name",
        width: "30%",
        dataIndex: "name",
        ellipsis: true,
      },
      {
        title: "Number of Households",
        key: 93,
        align: "center",
        dataIndex: 93,
        ellipsis: true,
      },
      {
        title: "Functionality",
        key: 101,
        align: "center",
        filters: [
          { text: "Functional", value: "yes" },
          { text: "Not Functional", value: "no" },
        ],
        dataIndex: 101,
        ellipsis: true,
      },
      {
        title: "Construction Year",
        key: 91,
        align: "right",
        dataIndex: 91,
        ellipsis: true,
      },
    ],
    maps: {
      shape: { id: 180, title: "Monthly Tariff" },
      marker: { id: 93, title: "Number of Water Point" },
    },
    formId: 4,
    values: [93, 101, 91],
  },
  health: {
    title: "Health Facility",
    columns: [
      {
        title: "Facilty Name",
        key: "name",
        width: "30%",
        dataIndex: "name",
        ellipsis: true,
      },
      {
        title: "Water",
        key: 32,
        align: "center",
        filters: [
          { text: "Basic", value: "basic" },
          { text: "Safely Managed", value: "safely managed" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 32,
        ellipsis: true,
      },
      {
        title: "Sanitation",
        key: 36,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 36,
        ellipsis: true,
      },
      {
        title: "Hygiene",
        key: 44,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 44,
        ellipsis: true,
      },
    ],
    maps: {
      shape: { id: 31, name: "Average number of patients per day" },
      marker: { id: 32, name: "Water Service Level" },
    },
    formId: 2,
    values: [32, 36, 44],
  },
  households: {
    title: "Households",
    columns: [
      {
        title: "Name",
        key: "name",
        width: "30%",
        dataIndex: "name",
        ellipsis: true,
      },
      {
        title: "Water",
        key: 7,
        align: "center",
        filters: [
          { text: "Basic", value: "basic" },
          { text: "Safely Managed", value: "safely managed" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 7,
        ellipsis: true,
      },
      {
        title: "Sanitation",
        key: 14,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 14,
        ellipsis: true,
      },
      {
        title: "Hygiene",
        key: 20,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 20,
        ellipsis: true,
      },
    ],
    maps: {
      shape: { id: 6, name: "Household Size" },
      marker: { id: 7, title: "Water Service Level" },
    },
    formId: 1,
    values: [7, 14, 20],
  },
  schools: {
    title: "Schools Facility",
    columns: [
      {
        title: "School Name",
        key: "name",
        width: "30%",
        dataIndex: "name",
        ellipsis: true,
      },
      {
        title: "Water",
        key: 63,
        align: "center",
        filters: [
          { text: "Basic", value: "basic" },
          { text: "Safely Managed", value: "safely managed" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 63,
        ellipsis: true,
      },
      {
        title: "Sanitation",
        key: 68,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 68,
        ellipsis: true,
      },
      {
        title: "Hygiene",
        key: 26,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 26,
        ellipsis: true,
      },
    ],
    maps: {
      shape: { id: 62, name: "Number of School Staff" },
      marker: { id: 63, title: "Water Service Level" },
    },
    formId: 3,
    values: [63, 68, 26],
  },
};
