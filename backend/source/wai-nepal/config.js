var site_name = "WAI Nepal";

var features = {
  chartFeature: {
    stack: false,
  },
};

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
        title: "Hand Washing Facility",
        key: 962764039,
      },
      {
        title: "Laterine",
        key: 962764019,
      },
    ],
    maps: {
      shape: { id: 976454019, name: "Household Size" },
      marker: { id: 962764019, title: "Laterine" },
    },
    formId: 994944020,
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
        key: 1000914105,
      },
      {
        title: "Handwashing",
        key: 964764100,
      },
      {
        title: "School Waste",
        key: 987374089,
      },
    ],
    maps: {
      shape: { id: 987364061, name: "Number of Student" },
      marker: { id: 1000914105, title: "Toilet" },
    },
    formId: 964754042,
  },
  health: {
    title: "Health Facility",
    columns: [
      {
        title: "Facilty Name",
        key: "name",
      },
      {
        title: "Hygiene Stations",
        key: 1177674247,
      },
      {
        title: "Cases of Dierhea",
        key: 1179634216,
      },
    ],
    maps: {
      shape: { id: 1179634216, name: "Cases of Diarhea" },
      marker: { id: 1179654241, name: "Main Source" },
    },
    formId: 1189144226,
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
      title: "Water Infrastructure",
      description:
        "This section contains technical and management data, and tracks the functionality of community water points. This is useful for month to month planning of maintenance and rehabilitation activities.",
      readmore: "#",
      explore: "#",
    },
  ],
  overviews: [
    [
      {
        type: "chart",
        category: "water-point",
      },
      {
        type: "info",
        category: "water-point",
        adm_level: 2,
        percent: 78,
        count: 282,
        text: "OF ##count## WATER POINTS ARE FUNCTIONAL",
        explore: "#",
      },
    ],
    [
      {
        type: "info",
        category: "odf",
        adm_level: 1,
        percent: 81,
        count: null,
        text: "OF ODF VILLAGES PER " + levels[0],
        explore: "#",
      },
      {
        type: "chart",
        category: "odf",
      },
    ],
    [
      {
        type: "chart",
        category: "health-facilities",
      },
      {
        type: "info",
        category: "health-facilities",
        adm_level: 1,
        percent: 4.5,
        count: null,
        text: "OF HEALTH FACILITIES HAVE BASIC WATER ACCESS",
        explore: "#",
      },
    ],
    [
      {
        type: "info",
        category: "schools",
        adm_level: 1,
        percent: 3.5,
        count: null,
        text: "OF SCHOOLS HAVE BASIC WATER ACCESS",
        explore: "#",
      },
      {
        type: "chart",
        category: "schools",
      },
    ],
  ],
};
