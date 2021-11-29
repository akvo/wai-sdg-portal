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
