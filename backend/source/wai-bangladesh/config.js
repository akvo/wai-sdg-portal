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
        key: 960314016,
      },
      {
        title: "Sanitation",
        key: 970604019,
      },
      {
        title: "Hygiene",
        key: 964704063,
      },
    ],
    maps: {
      shape: { id: 994964007, name: "Household Size" },
      marker: { id: 960314016, title: "Laterine" },
    },
    formId: 962774003,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 987314051, name: "Water" },
          { question: 1101254072, name: "Sanitation" },
          { question: 987294043, name: "Hygiene" },
        ],
      },
    ],
    selectableMarkerDropdown: [
      {
        id: 960314016,
        name: "Water Service Level",
        hover: [
          { id: 987364021, name: "Name of respondent" },
          {
            id: 573330121,
            name: "Household Size",
          },
        ],
      },
      {
        id: 970604019,
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
        id: 964704063,
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
      shape: { id: 993004046, name: "Sanitation" },
      marker: { id: 974764034, title: "Toilet" },
    },
    formId: 976564018,
    selectableMarkerDropdown: [
      {
        id: 996984034,
        name: "Water Service Level",
        hover: [
          { id: 987364021, name: "Name of school" },
          {
            id: 974754026,
            name: "School Size",
          },
        ],
      },
      {
        id: 974764034,
        name: "Sanitation Service Level",
        hover: [
          { id: 987364021, name: "Name of school" },
          {
            id: 974754026,
            name: "School Size",
          },
        ],
      },
      {
        id: 964704063,
        name: "Hygiene Service Level",
        hover: [
          { id: 987364021, name: "Name of school" },
          {
            id: 974754026,
            name: "School Size",
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
        key: 994994027,
      },
      {
        title: "Sanitation",
        key: 962804056,
      },
      {
        title: "Hygiene",
        key: 987364073,
      },
    ],
    maps: {
      shape: { id: 994994027, name: "Water" },
      marker: { id: 994994027, name: "Water Supply" },
    },
    formId: 952774024,
    selectableMarkerDropdown: [
      {
        id: 994994027,
        name: "Water Service Level",
        hover: [
          { id: 987364021, name: "Name of school" },
          {
            id: 974754044,
            name: "Type of health center",
          },
        ],
      },
      {
        id: 962804056,
        name: "Sanitation Service Level",
        hover: [
          { id: 987364021, name: "Name of school" },
          {
            id: 974754044,
            name: "Type of health center",
          },
        ],
      }
    ],
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
