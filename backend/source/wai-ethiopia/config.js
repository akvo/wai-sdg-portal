var levels = ["Woreda", "Kebele"];

var navigation_config = [
  {
    link: "water",
    name: "Water",
    childrens: null,
  },
  {
    link: "clts",
    name: "CLTS",
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

var map_config = {
  shapeLevels: ["UNIT_TYPE", "UNIT_NAME"],
  defCenter: [38.6682, 7.3942],
};

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
        title: "Source Type",
        key: 79,
        align: "center",
        dataIndex: 79,
        ellipsis: true,
      },
      {
        title: "Functionality",
        key: 80,
        align: "center",
        filters: [
          { text: "Functional", value: "functional" },
          { text: "Not Functional", value: "not functional" },
        ],
        dataIndex: 80,
        ellipsis: true,
      },
      {
        title: "Number of Users",
        key: 82,
        align: "right",
        dataIndex: 82,
        ellipsis: true,
      },
    ],
    charts: [
      { title: "Water Point Charts 01" },
      { title: "Water Point Charts 02" },
      { title: "Water Point Charts 03" },
      { title: "Water Point Charts 04" },
    ],
    maps: {
      shape: { id: 82, name: "Non Functional Taps" },
      marker: { id: 80, title: "Functionality Status" },
    },
    formId: 5,
    values: [79, 80, 82],
  },
  clts: {
    title: "CLTS",
    columns: [
      {
        title: "Name",
        key: "name",
        width: "30%",
        dataIndex: "name",
        ellipsis: true,
      },
      {
        title: "ODF Status",
        key: 8,
        align: "center",
        dataIndex: 8,
        ellipsis: true,
      },
      {
        title: "Date Triggered",
        key: 7,
        align: "center",
        dataIndex: 7,
        ellipsis: true,
      },
    ],
    charts: [
      { title: "CLTS Charts 01" },
      { title: "CLTS Charts 02" },
      { title: "CLTS Charts 03" },
      { title: "CLTS Charts 04" },
    ],
    maps: {
      shape: { id: 4, name: "Number of HHS" },
      marker: { id: 8, title: "ODF Status" },
    },
    formId: 1,
    values: [8, 7],
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
        key: 19,
        align: "center",
        filters: [
          { text: "Basic", value: "basic" },
          { text: "Safely Managed", value: "safely managed" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 19,
        ellipsis: true,
      },
      {
        title: "Sanitation",
        key: 21,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 21,
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
    charts: [
      { title: "Health Facility Charts 01" },
      { title: "Health Facility Charts 02" },
      { title: "Health Facility Charts 03" },
      { title: "Health Facility Charts 04" },
    ],
    maps: { shape: false, marker: { id: 19, name: "Water Service Level" } },
    formId: 2,
    values: [19, 21, 26],
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
        key: 35,
        align: "center",
        filters: [
          { text: "Basic", value: "basic" },
          { text: "Safely Managed", value: "safely managed" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 35,
        ellipsis: true,
      },
      {
        title: "Sanitation",
        key: 39,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 39,
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
    charts: [
      { title: "Household Charts 01" },
      { title: "Household Charts 02" },
      { title: "Household Charts 03" },
      { title: "Household Charts 04" },
    ],
    maps: {
      shape: { id: 33, name: "Household Size" },
      marker: { id: 35, title: "Water Service Level" },
    },
    formId: 3,
    values: [35, 39, 44],
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
        key: 56,
        align: "center",
        filters: [
          { text: "Basic", value: "basic" },
          { text: "Safely Managed", value: "safely managed" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 56,
        ellipsis: true,
      },
      {
        title: "Sanitation",
        key: 61,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 61,
        ellipsis: true,
      },
      {
        title: "Hygiene",
        key: 67,
        align: "center",
        filters: [
          { text: "Advanced", value: "basic" },
          { text: "Basic", value: "basic" },
          { text: "Limited", value: "limited" },
          { text: "No Service", value: "no service" },
        ],
        dataIndex: 67,
        ellipsis: true,
      },
    ],
    charts: [
      { title: "School Charts 01" },
      { title: "School Charts 02" },
      { title: "School Charts 03" },
      { title: "School Charts 04" },
    ],
    maps: {
      shape: { id: 48, name: "Female Pupils" },
      marker: { id: 56, title: "Water Service Level" },
    },
    formId: 4,
    values: [56, 61, 67],
  },
};
