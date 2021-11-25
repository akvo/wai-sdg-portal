var site_name = "WAI Nepal";

var features = {
  chartFeature: {
    stack: false,
  },
};

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

var page_config = {
  water: {
    title: "Water Point",
    columns: [
      {
        title: "Water Points",
        key: "name",
      },
      {
        title: "Source Type",
        key: 79,
      },
      {
        title: "Functionality",
        key: 80,
      },
      {
        title: "Number of Users",
        key: 82,
      },
    ],
    maps: {
      shape: { id: 82, name: "Non Functional Taps" },
      marker: { id: 80, title: "Functionality Status" },
    },
    formId: 5,
    default: {
      datapoint: 80,
      visualization: 79,
    },
  },
  clts: {
    title: "CLTS",
    columns: [
      {
        title: "Name",
        key: "name",
      },
      {
        title: "ODF Status",
        key: 8,
      },
      {
        title: "Date Triggered",
        key: 7,
      },
    ],
    maps: {
      shape: { id: 4, name: "Number of HHS" },
      marker: { id: 8, title: "ODF Status" },
    },
    formId: 1,
  },
  health: {
    title: "Health Facility",
    columns: [
      {
        title: "Facilty Name",
        key: "name",
      },
      {
        title: "Water",
        key: 19,
      },
      {
        title: "Sanitation",
        key: 21,
      },
      {
        title: "Hygiene",
        key: 26,
      },
    ],
    maps: {
      shape: { id: 19, name: "Water" },
      marker: { id: 19, name: "Water Service Level" },
    },
    formId: 2,
  },
  households: {
    title: "Households",
    columns: [
      {
        title: "Name",
        key: "name",
      },
      {
        title: "Water",
        key: 35,
      },
      {
        title: "Sanitation",
        key: 39,
      },
      {
        title: "Hygiene",
        key: 44,
      },
    ],
    maps: {
      shape: { id: 33, name: "Household Size" },
      marker: { id: 35, title: "Water Service Level" },
    },
    formId: 3,
  },
  schools: {
    title: "Schools Facility",
    columns: [
      {
        title: "School Name",
        key: "name",
      },
      {
        title: "Water",
        key: 56,
      },
      {
        title: "Sanitation",
        key: 61,
      },
      {
        title: "Hygiene",
        key: 67,
      },
    ],
    maps: {
      shape: { id: 48, name: "Female Pupils" },
      marker: { id: 56, title: "Water Service Level" },
    },
    formId: 4,
  },
};
