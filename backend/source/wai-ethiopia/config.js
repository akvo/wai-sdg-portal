var site_name = "WAI Ethiopia";

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
        width: "30%",
      },
      {
        title: "Source Type",
        key: 79,
        align: "center",
      },
      {
        title: "Functionality",
        key: 80,
        align: "center",
        filters: ["functional", "not functional"],
      },
      {
        title: "Number of Users",
        key: 82,
        align: "right",
      },
    ],
    maps: {
      shape: { id: 82, name: "Non Functional Taps" },
      marker: { id: 80, title: "Functionality Status" },
    },
    formId: 5,
  },
  clts: {
    title: "CLTS",
    columns: [
      {
        title: "Name",
        key: "name",
        width: "30%",
      },
      {
        title: "ODF Status",
        key: 8,
        align: "center",
      },
      {
        title: "Date Triggered",
        key: 7,
        align: "center",
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
        width: "30%",
      },
      {
        title: "Water",
        key: 19,
        align: "center",
        filters: ["basic", "safely managed", "limited", "no service"],
      },
      {
        title: "Sanitation",
        key: 21,
        align: "center",
        filters: ["advanced", "basic", "limited", "no service"],
      },
      {
        title: "Hygiene",
        key: 26,
        align: "center",
        filters: ["advanced", "basic", "limited", "no service"],
      },
    ],
    maps: { shape: false, marker: { id: 19, name: "Water Service Level" } },
    formId: 2,
  },
  households: {
    title: "Households",
    columns: [
      {
        title: "Name",
        key: "name",
        width: "30%",
      },
      {
        title: "Water",
        key: 35,
        align: "center",
        filters: ["basic", "safely managed", "limited", "no service"],
      },
      {
        title: "Sanitation",
        key: 39,
        align: "center",
        filters: ["advanced", "basic", "limited", "no service"],
      },
      {
        title: "Hygiene",
        key: 44,
        align: "center",
        filters: ["advanced", "basic", "limited", "no service"],
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
        width: "30%",
      },
      {
        title: "Water",
        key: 56,
        align: "center",
        filters: ["basic", "safely managed", "limited", "no service"],
      },
      {
        title: "Sanitation",
        key: 61,
        align: "center",
        filters: ["advanced", "basic", "limited", "no service"],
      },
      {
        title: "Hygiene",
        key: 67,
        align: "center",
        filters: ["advanced", "basic", "limited", "no service"],
      },
    ],
    maps: {
      shape: { id: 48, name: "Female Pupils" },
      marker: { id: 56, title: "Water Service Level" },
    },
    formId: 4,
  },
};
