var site_name = "WAI Uganda";

var features = {
  chartFeature: {
    stack: true,
  },
};

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
      },
      {
        title: "Number of Households",
        key: 93,
      },
      {
        title: "Functionality",
        key: 101,
      },
      {
        title: "Construction Year",
        key: 91,
        align: "right",
      },
    ],
    maps: {
      shape: { id: 180, title: "Monthly Tariff" },
      marker: { id: 93, title: "Number of Water Point" },
    },
    formId: 4,
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
        key: 32,
      },
      {
        title: "Sanitation",
        key: 36,
      },
      {
        title: "Hygiene",
        key: 44,
      },
    ],
    maps: {
      shape: { id: 31, name: "Average number of patients per day" },
      marker: { id: 32, name: "Water Service Level" },
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
        key: 7,
      },
      {
        title: "Sanitation",
        key: 14,
      },
      {
        title: "Hygiene",
        key: 20,
      },
    ],
    maps: {
      shape: { id: 6, name: "Household Size" },
      marker: { id: 7, title: "Water Service Level" },
    },
    formId: 1,
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
        key: 63,
      },
      {
        title: "Sanitation",
        key: 68,
      },
      {
        title: "Hygiene",
        key: 26,
      },
    ],
    maps: {
      shape: { id: 62, name: "Number of School Staff" },
      marker: { id: 63, title: "Water Service Level" },
    },
    formId: 3,
  },
};
