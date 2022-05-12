/* eslint-disable */
var site_name = "WAI Nepal";

var features = {
  chartFeature: {
    stack: false,
  },
  advancedFilterFeature: {
    isMultiSelect: true,
  },
};

var links = [
  {
    title: "Project Details",
    to: "project",
  },
  {
    title: "Reservoir",
    to: "reservoir",
  },
  {
    title: "Water Source",
    to: "waterSource",
  },
  {
    title: "Taps",
    to: "taps",
  },
  {
    title: "WUSC",
    to: "wusc",
  },
];

var navigation_config = [
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
  {
    link: "projects",
    name: "Projects",
    childrens: [
      {
        link: "project",
        name: "Project Details",
      },
      {
        link: "reservoir",
        name: "Reservoir",
      },
      {
        link: "taps",
        name: "Taps",
      },
      {
        link: "waterSource",
        name: "Water Source",
      },
      {
        link: "wusc",
        name: "WUSC",
      },
    ],
  },
];

var page_config = {
  households: {
    title: "Households",
    columns: [
      {
        title: "Name",
        key: "name",
      },
      {
        title: "Sanitation Service Level",
        key: 569340075,
      },
      {
        title: "Hygiene Service Level",
        key: 569340076,
      },
      {
        title: "Water Service Level",
        key: 569340077,
      },
    ],
    maps: {
      shape: { id: 573330121, name: "Household Size" },
      marker: { id: 569340075, title: "Water Service Level" },
    },
    formId: 556240162,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 569340077, name: "Water Service Level" },
          { question: 569340075, name: "Sanitation Service Level" },
          { question: 569340076, name: "Hygiene Service Level" },
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
        title: "Toilet",
        key: 567800083,
      },
      {
        title: "Handwashing",
        key: 578820194,
      },
      {
        title: "Water Service Levels",
        key: 573300191,
      },
    ],
    maps: {
      shape: { id: 573300189, name: "Sanitation Service Levels" },
      marker: { id: 567800083, title: "Toilet" },
    },
    formId: 554360198,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 567800083, name: "Toilet" },
          { question: 573300191, name: "Water Service Levels" },
          { question: 578820194, name: "Handwashing" },
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
        title: "Water Service Levels",
        key: 578820188,
      },
      {
        title: "Sanitation Service Levels",
        key: 578820187,
      },
    ],
    maps: {
      shape: { id: 578820188, name: "Water Service Levels" },
      marker: { id: 578820186, name: "Hygiene Service Levels" },
    },
    formId: 557950127,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 578820188, name: "Water Service Levels" },
          { question: 578820187, name: "Sanitation Service Levels" },
        ],
      },
    ],
  },
  project: {
    title: "Projects Details",
    columns: [
      {
        title: "Project Name",
        key: 1260775110,
      },
      {
        title: "#Water Source",
        key: 1332184057,
        width: "120px",
      },
      {
        title: "#Reservoirs",
        key: 1361884006,
        width: "100px",
      },
      {
        title: "#Taps",
        key: 1361834041,
        width: "80px",
      },
      {
        title: "#WUSC",
        key: 1336894024,
        width: "80px",
      },
    ],
    maps: {
      shape: { id: 1260775111, name: "Project Type" },
      marker: { id: 1260775109, name: "Construction Agency" },
    },
    formId: 1323574110,
    links: links,
  },
  waterSource: {
    title: "Water Source",
    columns: [
      {
        title: "Name",
        key: 1348864008,
      },
      {
        title: "Registration",
        key: 1351624037,
      },
      {
        title: "Type",
        key: 1322844012,
      },
      {
        title: "Present",
        key: 1351624035,
      },
      {
        title: "Quality",
        key: 1322844007,
      },
    ],
    maps: {
      shape: { id: 1322844012, name: "Water Source Type" },
      marker: { id: 1322844007, name: "Quality" },
    },
    formId: 1322834054,
    links: links,
  },
  reservoir: {
    title: "Reservoir",
    columns: [
      {
        title: "RVT No",
        key: 1312464879,
      },
      {
        title: "Type",
        key: 1317494088,
      },
      {
        title: "Adequacy",
        key: 1312455208,
      },
      {
        title: "Condition",
        key: 1325445108,
      },
    ],
    maps: {
      shape: { id: 1284004080, name: "RVT Capacity" },
      marker: { id: 1317494088, name: "RVT Type" },
    },
    formId: 1260775092,
    links: links,
  },
  taps: {
    title: "Taps",
    columns: [
      {
        title: "Project Name",
        key: "name",
      },
      {
        title: "Type",
        key: 1323564078,
      },
      {
        title: "Metered Connection",
        key: 1325524076,
      },
      {
        title: "# of Household",
        key: 1329264106,
      },
      {
        title: "Tap Condition",
        key: 1325534094,
      },
    ],
    maps: {
      shape: { id: 1329264106, name: "Number of Household" },
      marker: { id: 1323564078, name: "Tap Type" },
    },
    formId: 1327205184,
    links: links,
  },
  wusc: {
    title: "WUSC",
    columns: [
      {
        title: "Project Name",
        key: "name",
      },
      {
        title: "Project Code",
        key: 1336894024,
      },
    ],
    maps: {
      shape: { id: 1260775111, name: "Project Type" },
      marker: { id: 1336894024, name: "Project Code" },
    },
    formId: 1338414049,
    links: links,
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
      title: "Water Infrastructure",
      description:
        "This section contains technical and management data, and tracks the functionality of community water points. This is useful for month to month planning of maintenance and rehabilitation activities.",
      readmore: "#",
      explore: "#",
    },
  ],
  overviews: [
    {
      form_id: 554360198,
      name: "Schools",
      question: 567800083,
      option: "yes",
      above_text: "Across the District",
      number_text: "of ##total## schools have toilet",
      explore: "#",
    },
    {
      form_id: 557950127,
      name: "Health Facilities",
      question: 554400065,
      option: "yes",
      above_text: "Across the District",
      number_text: "of ##total## health facilities have toilet",
      explore: "#",
    },
  ],
};
