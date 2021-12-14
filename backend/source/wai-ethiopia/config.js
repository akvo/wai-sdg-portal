var site_name = "WAI Ethiopia";

var features = {
  chartFeature: {
    stack: false,
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
      shape: { id: 559820212, name: "Household Size" },
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
      marker: { id: 561200191, title: "Functionality Status" },
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
  },
};

var landing_config = {
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
