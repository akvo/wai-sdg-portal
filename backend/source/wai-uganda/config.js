/* eslint-disable */
var site_name = "WAI Uganda";
var AUTH0_DOMAIN = "https://wai-uganda.eu.auth0.com";
var AUTH0_CLIENT_ID = "9N7pL6UiEHbQb3sxUbeopEfACg6acmNq";

var features = {
  chartFeature: {
    stack: true,
  },
  advancedFilterFeature: {
    isMultiSelect: true,
  },
  formFeature: {
    allowEdit: false,
    allowAddNew: false,
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
    name: "CLTS Plus",
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
        key: 111,
      },
      {
        title: "Construction Year",
        key: 91,
        align: "right",
      },
    ],
    maps: {
      shape: { id: 96, title: "Monthly Tariff" },
      marker: { id: 111, title: "Functionality Status" },
    },
    formId: 4,
    selectableMarkerDropdown: [
      {
        id: 111,
        name: "Functionality Status",
        hover: [
          {
            name: "Water point name",
            id: 85,
          },
        ],
      },
    ],
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
        key: 557700349,
      },
      {
        title: "Date Triggered",
        key: 559830326,
      },
    ],
    maps: {
      shape: { id: 567440335, name: "Number of HHS" },
      marker: { id: 557700349, title: "ODF Status" },
    },
    formId: 5,
    rows: [
      {
        component: "PIE-CHART-GROUP",
        chartList: [
          {
            type: "PIE",
            question: 569090299,
            name: "Water and Soap",
          },
          {
            type: "PIE",
            question: 571070202,
            name: "No Visible Feces Found",
          },
          {
            type: "PIE",
            question: 573010345,
            name: "Public Toilets",
          },
          {
            type: "PIE",
            question: 557710261,
            name: "Toilets were Available for Pessangers",
          },
          { type: "PIE", question: 557700349, name: "ODF Status" },
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
          name: 569070281,
          startValue: 569070282,
          startDate: 559830326,
          endValue: 569090301,
          endDate: 557690351,
        },
      },
    ],
    selectableMarkerDropdown: [
      {
        id: 557700349,
        name: "Open Defecation Status",
        hover: [
          {
            id: 569070281,
            name: "Village Name",
          },
          {
            id: 567440335,
            name: "Number of households in the Village",
          },
        ],
      },
      {
        id: 494780324,
        name: "Implementing partner",
        color: [
          {
            name: "Amref",
            color: "#9FE07F",
          },
          {
            name: "Amref and Local Government",
            color: "#F67070",
          },
          {
            name: "Other",
            color: "fee08f",
          },
        ],
        hover: [
          {
            id: 569070281,
            name: "Village Name",
          },
          {
            id: 567440335,
            name: "Number of households in the Village",
          },
        ],
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
        key: "water",
        category: true,
      },
      {
        title: "Sanitation",
        key: "sanitation",
        category: true,
      },
      {
        title: "Hygiene",
        key: "hygiene",
        category: true,
      },
    ],
    maps: {
      shape: { id: 31, name: "Average number of patients per day" },
      marker: { id: "Water", name: "Water Service Level" },
    },
    formId: 2,
    selectableMarkerDropdown: [
      {
        id: "Water",
        name: "Water Service Level",
        hover: [
          {
            id: 27,
            name: "Health Care Facility Name",
          },
          {
            id: 30,
            name: "Health Care Facility Type",
          },
        ],
      },
      {
        id: "Sanitation",
        name: "Sanitation Service Level",
        hover: [
          {
            id: 27,
            name: "Health Care Facility Name",
          },
          {
            id: 30,
            name: "Health Care Facility Type",
          },
        ],
      },
      {
        id: "Hygiene",
        name: "Hygiene Service Level",
        hover: [
          {
            id: 27,
            name: "Health Care Facility Name",
          },
          {
            id: 30,
            name: "Health Care Facility Type",
          },
        ],
      },
    ],
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
        key: "water",
        category: true,
      },
      {
        title: "Sanitation",
        key: "sanitation",
        category: true,
      },
      {
        title: "Hygiene",
        key: "hygiene",
        category: true,
      },
    ],
    maps: {
      shape: {
        id: "Sanitation",
        name: "Sanitation Service Level (Basic or higher)",
        // set to true if title of shape legend by calculatedBy value
        isTitleByCalculated: false,
        // describe option value will be included for the calculation
        calculatedBy: [
          { id: 18, name: "Safely Managed" },
          { id: 14, name: "Basic" },
        ],
        // describe the shape calculation type
        type: "percentage",
      },
      marker: { id: "Water", title: "Water Service Level" },
    },
    formId: 1,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: "water", name: "Water Service Level" },
          { question: "sanitation", name: "Sanitation Service Level" },
          { question: "hygiene", name: "Hygiene Service Level" },
        ],
      },
    ],
    selectableMarkerDropdown: [
      {
        id: "Water",
        name: "Water Service Level",
        hover: [
          { id: 3, name: "Village Name" },
          {
            id: 6,
            name: "Household Size",
          },
        ],
      },
      {
        id: "Sanitation",
        name: "Sanitation Service Level",
        hover: [
          { id: 3, name: "Village Name" },
          {
            id: 6,
            name: "Household Size",
          },
        ],
      },
      {
        id: "Hygiene",
        name: "Hygiene Service Level",
        hover: [
          { id: 3, name: "Village Name" },
          {
            id: 6,
            name: "Household Size",
          },
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
        key: "water",
        category: true,
      },
      {
        title: "Sanitation",
        key: "sanitation",
        category: true,
      },
      {
        title: "Hygiene",
        key: "hygiene",
        category: true,
      },
    ],
    maps: {
      shape: { id: 23, name: "Number of School Staff" },
      marker: { id: "Water", title: "Water Service Level" },
    },
    formId: 3,
    selectableMarkerDropdown: [
      {
        id: "Water",
        name: "Water service levels",
        hover: [
          {
            id: 56,
            name: "School Name",
          },
          {
            id: 58,
            name: "School Type",
          },
        ],
      },
      {
        id: "Sanitation",
        name: "Sanitation service levels",
        hover: [
          {
            id: 56,
            name: "School Name",
          },
          {
            id: 58,
            name: "School Type",
          },
        ],
      },
      {
        id: "Hygiene",
        name: "Hygiene service levels",
        hover: [
          {
            id: 56,
            name: "School Name",
          },
          {
            id: 58,
            name: "School Type",
          },
        ],
      },
    ],
  },
};

var landing_config = {
  jumbotron: {
    // title, the text or list title
    title:
      "This portal is used at the ##administration## level to see the relative WASH vulnerability of communities and institutions, and track the status of water and sanitation infrastructure",
    // list_type, can be bullet/number or null if no list
    list_type: null,
    // list, describe the list as an array of text or empty array [] if no list
    list: [],
  },
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
      form_id: 1,
      name: "Households",
      key: "households",
      chartList: [
        {
          question: null,
          title: "Service level for drinking water in households",
          path: "Water",
          order: 1,
        },
        {
          question: null,
          title: "Service level for sanitation in households",
          path: "Sanitation",
          order: 2,
        },
        {
          question: null,
          title: "Service level for Hygiene in households",
          path: "Hygiene",
          order: 3,
        },
      ],
    },
    {
      form_id: 2,
      name: "Health Facilities",
      key: "health",
      chartList: [
        {
          question: null,
          title: "Service level for water in health facilities",
          path: "Water",
          order: 1,
        },
        {
          question: null,
          title: "Service level for sanitation in health facilities",
          path: "Sanitation",
          order: 2,
        },
        {
          question: null,
          title: "Service level for hygiene in health facilities",
          path: "Hygiene",
          order: 3,
        },
        {
          question: null,
          title: "Service level for waste management in health facilities",
          path: "Waste Management",
          order: 4,
        },
        {
          question: null,
          title:
            "Service level for environmental cleaning in health facilities",
          path: "Environmental Cleaning",
          order: 5,
        },
      ],
    },
    {
      form_id: 3,
      name: "Schools",
      key: "schools",
      chartList: [
        {
          question: null,
          title: "Service level for drinking water in schools",
          path: "Water",
          order: 1,
        },
        {
          question: null,
          title: "Service level for sanitation in schools",
          path: "Sanitation",
          order: 2,
        },
        {
          question: null,
          title: "Service level for Hygiene in schools",
          path: "Hygiene",
          order: 3,
        },
      ],
    },
    {
      form_id: 4,
      name: "Water Point",
      key: "water",
      chartList: [
        {
          question: 111,
          title: "Functionality Status",
          path: null,
          order: 1,
        },
      ],
    },
  ],
};
