/* eslint-disable */
var site_name = "WAI Bangladesh";
var AUTH0_DOMAIN = "https://wai-bangladesh.eu.auth0.com";
var AUTH0_CLIENT_ID = "KsXzEv44hzuEKPSRCowXOJS8CqxsvUpt";

/*
 * position for landing page
 * optional:
 */
var landing_map_pos = 1.2;

var features = {
  chartFeature: {
    stack: false,
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
        title: "ID",
        key: "id",
      },
      {
        title: "Water",
        key: "water",
      },
      {
        title: "Sanitation",
        key: "sanitation",
      },
      {
        title: "Hygiene",
        key: "hygiene",
      },
    ],
    maps: {
      shape: { id: 554190060, name: "Household Size" },
      marker: { id: 527870065, title: "Laterine" },
    },
    formId: 574850091,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: "water", name: "Water" },
          { question: "sanitation", name: "Sanitation" },
          { question: "hygiene", name: "Hygiene" },
        ],
      },
    ],
    selectableMarkerDropdown: [
      {
        id: 527870065,
        name: "Water Service Level",
        hover: [
          { id: 554190059, name: "Name of respondent" },
          {
            id: 554190060,
            name: "Household Size",
          },
        ],
      },
      {
        id: 544110058,
        name: "Sanitation Service Level",
        hover: [
          { id: 554190059, name: "Name of respondent" },
          {
            id: 554190060,
            name: "Household Size",
          },
        ],
      },
      {
        id: 569140059,
        name: "Hygiene Service Level",
        hover: [
          { id: 554190059, name: "Name of respondent" },
          {
            id: 554190060,
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
      },
      {
        title: "Sanitation",
        key: "sanitation",
      },
      {
        title: "Hygiene",
        key: "hygiene",
      },
    ],
    maps: {
      shape: { id: "Sanitation", name: "Sanitation" },
      marker: { id: 563280069, title: "Toilet" },
    },
    formId: 563280066,
    selectableMarkerDropdown: [
      {
        id: 563280069,
        name: "Water Service Level",
        hover: [
          { id: 569130080, name: "Name of school" },
          {
            id: 629850003,
            name: "School Size",
          },
        ],
      },
      {
        id: 578820058,
        name: "Sanitation Service Level",
        hover: [
          { id: 569130080, name: "Name of school" },
          {
            id: 629850003,
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
        title: "Health Care Facilty Name",
        key: "name",
      },
      {
        title: "Water",
        key: "water",
      },
      {
        title: "Sanitation",
        key: "sanitation",
      },
      {
        title: "Hygiene",
        key: "hygiene",
      },
    ],
    maps: {
      shape: { id: "Water", name: "Water" },
      marker: { id: 567530047, name: "Toilet" },
    },
    formId: 557760069,
    selectableMarkerDropdown: [
      {
        id: 571110060,
        name: "Water Service Level",
        hover: [
          { id: 573100084, name: "Healthcare name" },
          {
            id: 573100086,
            name: "Type of health center",
          },
        ],
      },
      {
        id: 567530047,
        name: "Sanitation Service Level",
        hover: [
          { id: 573100084, name: "Healthcare name" },
          {
            id: 573100086,
            name: "Type of health center",
          },
        ],
      },
      {
        id: 559910085,
        name: "Waste Management",
        hover: [
          { id: 573100084, name: "Healthcare name" },
          {
            id: 573100086,
            name: "Type of health center",
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
      "This portal is used at union and municipality level to see the relative WASH vulnerability of communities and institutions",
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
  ],
  overviews: [
    {
      form_id: 574850091,
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
      form_id: 557760069,
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
      form_id: 563280066,
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
  ],
};
