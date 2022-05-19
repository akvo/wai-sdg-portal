var site_name = "WAI Bangladesh";

var features = {
  chartFeature: {
    stack: false,
  },
  advancedFilterFeature: {
    isMultiSelect: true,
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
        title: "Water",
        key: 987314051,
      },
      {
        title: "Sanitation",
        key: 950854035,
      },
      {
        title: "Hygiene",
        key: 964704062,
      },
    ],
    maps: {
      shape: { id: 573330121, name: "Household Size" },
      marker: { id: 962764019, title: "Laterine" },
    },
    formId: 962774003,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 987314051, name: "Water" },
          { question: 976484035, name: "Sanitation" },
          { question: 964704062, name: "Hygiene" },
        ],
      },
    ],
    selectableMarkerDropdown: [
      {
        id: 573340127,
        name: "Water Service Level",
        hover: [
          { id: 573330119, name: "Name of respondent" },
          {
            id: 573330121,
            name: "Household Size",
          },
        ],
      },
      {
        id: 557970124,
        name: "Sanitation Service Level",
        hover: [
          { id: 573330119, name: "Name of respondent" },
          {
            id: 573330121,
            name: "Household Size",
          },
        ],
      },
      {
        id: 563480061,
        name: "Hygiene Service Level",
        hover: [
          { id: 573330119, name: "Name of respondent" },
          {
            id: 573330121,
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
        key: 996984059,
      },
      {
        title: "Sanitation",
        key: 993004046,
      },
      {
        title: "Hygiene",
        key: 996974069,
      },
    ],
    maps: {
      shape: { id: 974754026, name: "Number of Student" },
      marker: { id: 993004033, title: "Toilet" },
    },
    formId: 976564018,
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
        key: 994994027,
      },
      {
        title: "Sanitation",
        key: 964754032,
      },
      {
        title: "Hygiene",
        key: 987364073,
      },
    ],
    maps: {
      shape: { id: 1000914052, name: "Cases of Diarhea" },
      marker: { id: 987364073, name: "Hygiene Stations" },
    },
    formId: 952774024,
  },
};

var landing_config = {
  jumbotron: {
    // title, the text or list title
    title:
      "This portal is used at union and municipality level to see the relative WASH vulnerability of communities and institutions", // the text or list title
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
      form_id: 976564018,
      name: "Schools",
      question: 993004033,
      option: "yes",
      above_text: "Across the District",
      number_text: "of ##total## schools have toilet",
      explore: "#",
    },
    {
      form_id: 952774024,
      name: "Health Facilities",
      question: 987364073,
      option: "yes",
      above_text: "Across the District",
      number_text: "of ##total## hygiene stations available",
      explore: "#",
    },
  ],
};
