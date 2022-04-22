var site_name = "WAI Ethiopia";

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
    link: "water",
    name: "Water Points",
    childrens: null,
  },
  {
    link: "clts",
    name: "CLTS Plus",
    childrens: null,
  },
  {
    link: "jmp",
    name: "WASH Service Levels",
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
        title: "Water Source Type",
        key: 571050096,
      },
      {
        title: "Functionality Status",
        key: 567450085,
      },
      {
        title: "Problems With Water System",
        key: 571060084,
      },
    ],
    maps: {
      shape: { id: 567400198, name: "Number of Users" },
      marker: { id: 567450085, title: "Functionality Status" },
    },
    formId: 571070071,
    default: {
      datapoint: 567450085,
      visualization: 571050096,
    },
    selectableMarkerDropdown: [
      {
        id: 567450085,
        name: "Functionality Status",
        hover: [
          {
            id: 571070074,
            name: "Water Point Name",
          },
          {
            id: 571060084,
            name: "Problems With Water System",
          },
        ],
      },
      {
        id: 571050096,
        name: "Water Source Type",
        color: [
          {
            name: "Deep well with distribution",
            color: "#4475B4",
          },
          {
            name: "Hand dug well",
            color: "#73ADD1",
          },
          {
            name: "Shallow well",
            color: "#AAD9E8",
          },
          {
            name: "Protected spring",
            color: "#FBE08F",
          },
          {
            name: "Unprotected spring",
            color: "#F8AE60",
          },
          {
            name: "Rainwater collection",
            color: "#F36C42",
          },
          {
            name: "Surface water",
            color: "#D73027",
          },
        ],
        hover: [
          {
            id: 573000210,
            name: "Maximum Yield (lpd)",
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
    formId: 567420197,
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
        id: 569090299,
        name: "Presence of Handwashing Facility with Water and Soap",
        color: [
          {
            name: "Yes",
            color: "#9FE07F",
          },
          {
            name: "No",
            color: "#F67070",
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
        key: 569080377,
      },
      {
        title: "Sanitation",
        key: 569080376,
      },
      {
        title: "Hygiene",
        key: 569080380,
      },
    ],
    maps: {
      shape: { id: 569080377, name: "Water" },
      marker: { id: 569080377, name: "Water Service Level" },
    },
    rows: [
      {
        component: "PIE-CHART-GROUP",
        chartList: [
          {
            type: "PIE",
            question: 559830320,
            name: "Toilets are Sex-Separated",
          },
          {
            type: "PIE",
            question: 559830321,
            name: "At Least One Toilet was Usable",
          },
          {
            type: "PIE",
            question: 559830322,
            name: "Dedicated Toilet for Staff",
          },
          {
            type: "PIE",
            question: 559830318,
            name: "Toilets have Menstrual Hygiene Facilities",
          },
          {
            type: "PIE",
            question: 559830319,
            name: "Toilets Accessible for People with Limited Mobility",
          },
        ],
      },
    ],
    formId: 494780323,
    selectableMarkerDropdown: [
      {
        id: 569080377,
        name: "Water service level",
        hover: [
          {
            id: 555940315,
            name: "Health Care Facility Name",
          },
          {
            id: 555940316,
            name: "Health Care Facility Type",
          },
        ],
      },
      {
        id: 569080376,
        name: "Sanitation service level",
        hover: [
          {
            id: 555940315,
            name: "Health Care Facility Name",
          },
          {
            id: 555940316,
            name: "Health Care Facility Type",
          },
        ],
      },
      {
        id: 569080380,
        name: "Hygiene service level",
        hover: [
          {
            id: 555940315,
            name: "Health Care Facility Name",
          },
          {
            id: 555940316,
            name: "Health Care Facility Type",
          },
        ],
      },
      {
        id: 569080379,
        name: "Environmental Cleaning service level",
        hover: [
          {
            id: 555940315,
            name: "Health Care Facility Name",
          },
          {
            id: 555940316,
            name: "Health Care Facility Type",
          },
        ],
      },
      {
        id: 569080378,
        name: "Waste service level",
        hover: [
          {
            id: 555940315,
            name: "Health Care Facility Name",
          },
          {
            id: 555940316,
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
        key: 573020156,
      },
      {
        title: "Sanitation",
        key: 569090236,
      },
      {
        title: "Hygiene",
        key: 573010267,
      },
    ],
    maps: {
      shape: {
        id: 569090236,
        name: "Sanitation Service Level (Basic or higher)",
        // set to true if title of shape legend by calculatedBy value
        isTitleByCalculated: false,
        // describe option value will be included for the calculation
        calculatedBy: [
          { id: 234, name: "Safely Managed" },
          { id: 235, name: "Basic" },
        ],
        // describe the shape calculation type
        type: "percentage",
        // shape legend type, slider or null (default)
        legend: null,
        // color range for shape shading, jmp or null (default)
        color: "jmp",
        // sanitation / water / hygiene / null (default)
        jmpType: null,
      },
      marker: { id: 573020156, title: "Water Service Level" },
    },
    formId: 567420165,
    tabs: [
      {
        name: "JMP",
        component: "JMP-CHARTS",
        selected: true,
        chartList: [
          { question: 573020156, name: "Water Service Level" },
          { question: 569090236, name: "Sanitation Service Level" },
          { question: 573010267, name: "Hygiene Service Level" },
        ],
      },
    ],
    selectableMarkerDropdown: [
      {
        id: 573020156,
        name: "Water Service Level",
        hover: [
          { id: 554110154, name: "Village Name" },
          {
            id: 559820212,
            name: "Household Size",
          },
        ],
      },
      {
        id: 569090236,
        name: "Sanitation Service Level",
        hover: [
          { id: 554110154, name: "Village Name" },
          {
            id: 559820212,
            name: "Household Size",
          },
        ],
      },
      {
        id: 573010267,
        name: "Hygiene Service Level",
        hover: [
          { id: 554110154, name: "Village Name" },
          {
            id: 559820212,
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
        key: 559810275,
      },
      {
        title: "Sanitation",
        key: 571070148,
      },
      {
        title: "Hygiene",
        key: 546580270,
      },
    ],
    maps: {
      shape: { id: 561200194, name: "Water Yield" },
      marker: { id: 559810275, title: "Water service levels" },
    },
    rows: [
      {
        component: "PIE-CHART-GROUP",
        chartList: [
          {
            type: "PIE",
            question: 557690281,
            name: "Toilets are Sex-Separated",
          },
          {
            type: "PIE",
            question: 557690277,
            name: "Separate Toilets for Staff",
          },
          {
            type: "PIE",
            question: 555930269,
            name: "Usable Urinals Available for Boys",
          },
          {
            type: "PIE",
            question: 555950240,
            name: "Usable Urinals Available for Girls",
          },
          {
            type: "PIE",
            question: 557690283,
            name: "Toilets Accessible for People with Limited Mobility",
          },
        ],
      },
    ],
    formId: 551870264,
    selectableMarkerDropdown: [
      {
        id: 559810275,
        name: "Water service levels",
        hover: [
          {
            id: 546580264,
            name: "School Name",
          },
          {
            id: 546580263,
            name: "School Type",
          },
        ],
      },
      {
        id: 571070148,
        name: "Sanitation service levels",
        hover: [
          {
            id: 546580264,
            name: "School Name",
          },
          {
            id: 546580263,
            name: "School Type",
          },
        ],
      },
      {
        id: 546580270,
        name: "Hygiene service levels",
        hover: [
          {
            id: 546580264,
            name: "School Name",
          },
          {
            id: 546580263,
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
      "This portal is to support ##administration## authorities decision-making by tracking:", // the text or list title
    // list_type, can be bullet/number or null if no list
    list_type: "number",
    // list, describe the list as an array of text or empty array [] if no list
    list: [
      "WASH vulnerability of communities and institutions.",
      "ODF status of communities.",
      "Water infrastructure status.",
    ],
  },
  datasetsInPortal: [
    {
      title: "WASH Service Levels",
      description:
        "The JMP/SDG indicators describe the WASH service levels of communities, schools and health facilities, offering an approach to rank the vulnerability of these entities. This section helps WASH authorities to prioritize funding and resources to the most vulnerable.",
      readmore: "#",
      explore: "#",
    },
    {
      title: "CLTS Plus",
      description:
        "Community Led Total Sanitation Plus is a methodology for achieving open defecation free and adequate coverage of sanitation facilities. This section tracks the progress of CLTS implementors.",
      readmore: "#",
      explore: "#",
    },
    {
      title: "Community Water Points",
      description:
        "This section contains technical and management data, and tracks the functionality of community water points. This is useful for month to month planning of maintenance and rehabilitation activities.",
      readmore: "#",
      explore: "#",
    },
  ],
  overviews: [
    {
      form_id: 571070071,
      name: "Water Point",
      question: 567450085,
      option: "Functional",
      above_text: "",
      number_text: "of ##total## water points are functional",
      explore: "#",
    },
    {
      form_id: 567420197,
      name: "CLTS",
      question: 557700349,
      option: "Verified ODF",
      above_text: "",
      number_text: "of villages are Verified ODF",
      explore: "#",
    },
    {
      form_id: 494780323,
      name: "Health Facilities",
      question: 569080378,
      option: "Basic",
      above_text: "",
      number_text: "of health facilities have basic water access",
      explore: "#",
    },
    {
      form_id: 551870264,
      name: "Schools",
      question: 559810275,
      option: "Basic",
      above_text: "",
      number_text: "of schools have basic water access",
      explore: "#",
    },
  ],
};
