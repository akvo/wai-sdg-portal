/* eslint-disable */
var site_name = "WAI Uganda";

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
      shape: { id: 96, title: "Monthly Tariff" },
      marker: { id: 90, title: "Number of Water Point" },
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
      form_id: 4,
      name: "Water Point",
      question: 101,
      option: "yes",
      above_text: "Across the District",
      number_text: "of ##total## water points are functional",
      explore: "#",
    },
    {
      form_id: 2,
      name: "Health Facilities",
      question: 32,
      option: "basic",
      above_text: "Across the District",
      number_text: "of health facilities have basic water access",
      explore: "#",
    },
    {
      form_id: 3,
      name: "Schools",
      question: 63,
      option: "basic",
      above_text: "Across the District",
      number_text: "of schools have basic water access",
      explore: "#",
    },
  ],
};
