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
    rows: [
      {
        component: "PIE-CHART-GROUP",
        formId: 4 /* FIXME Follows Parrent FormId if not available */,
        chartList: [
          {
            type: "PIE",
            question: 62,
            name: "latrine for boys and girls separate",
          },
          {
            type: "PIE",
            question: 65,
            name: "are there latrines for disabled?",
          },
          {
            type: "PIE",
            question: 68,
            name: "presence of handwashingfacility",
          },
          { type: "PIE", question: 69, name: "hand washing in use" },
          { type: "PIE", question: 8, formId: 1, name: "ODF Status" },
        ],
      },
    ],
    tabs: [
      {
        name: "Progress",
        component: "ODF-CHARTS",
        selected: true,
        showPagination: true,
        chartSetting: {
          name: 2,
          startValue: 5,
          startDate: 7,
          endValue: 6,
          endDate: 10,
        },
      },
    ],
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
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 35, name: "Water Service Level" },
          { question: 39, name: "Sanitation Service Level" },
          { question: 44, name: "Hygiene Service Level" },
        ],
      },
    ],
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

var landing_config = {
  datasetsInPortal: [
    {
      title: "JMP/SDG Status",
      description:
        "The JMP/SDG indicators describe the WASH service levels of communities, schools and health facilities, offering an approach to rank the vulnerability of these entities. This section helps WASH authorities to prioritize funding and resources to the most vulnerable.",
      readmore: "#",
      explore: "#",
    },
    {
      title: "CLTS + Progress",
      description:
        "Community Led Total Sanitation Plus is a methodology for achieving open defecation free and adequate coverage of sanitation facilities. This section tracks the progress of CLTS implementors.",
      readmore: "#",
      explore: "#",
    },
    {
      title: "Water Infrastructure",
      description:
        "This section contains technical and management data, and tracks the functionality of community water points. This is useful for month to month planning of maintenance and rehabilitation activities.",
      readmore: "#",
      explore: "#",
    },
  ],
  overviews: [
    {
      form_id: 5,
      name: "Water Point",
      question: 80,
      option: "functional",
      above_text: "Across 2 Kebele",
      number_text: "of ##total## water points are functional",
      explore: "#",
    },
    {
      form_id: 1,
      name: "CLTS",
      question: 8,
      option: "verified",
      above_text: "Across the Woreda",
      number_text: "of odf villages per Woreda",
      explore: "#",
    },
    {
      form_id: 2,
      name: "Health Facilities",
      question: 19,
      option: "basic",
      above_text: "Across the Woreda",
      number_text: "of health facilities have basic water access",
      explore: "#",
    },
    {
      form_id: 4,
      name: "Schools",
      question: 56,
      option: "basic",
      above_text: "Across the Woreda",
      number_text: "of schools have basic water access",
      explore: "#",
    },
  ],
};
