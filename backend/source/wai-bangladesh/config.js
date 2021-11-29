var site_name = "WAI Bangladesh";

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
  health: {
    title: "Health Facility",
    columns: [
      {
        title: "Facilty Name",
        key: "name",
      },
      {
        title: "Type",
        key: 974754044,
      },
      {
        title: "Water Source",
        key: 994994027,
      },
    ],
    maps: {
      shape: { id: 1000914052, name: "Cases of Diarhea" },
      marker: { id: 987364073, name: "Hygiene Stations" },
    },
    formId: 952774024,
  },
  households: {
    title: "Households",
    columns: [
      {
        title: "Name",
        key: "name",
      },
      {
        title: "Water Salinity",
        key: 1093164024,
      },
      {
        title: "Arsenic",
        key: 1089314018,
      },
    ],
    maps: {
      shape: { id: 994964007, name: "Household Size" },
      marker: { id: 962764019, title: "Laterine" },
    },
    formId: 962774003,
  },
  schools: {
    title: "Schools Facility",
    columns: [
      {
        title: "School Name",
        key: "name",
      },
      {
        title: "Handwashing",
        key: 987364056,
      },
      {
        title: "Has Toilet",
        key: 993004033,
      },
    ],
    maps: {
      shape: { id: 974754026, name: "Number of Student" },
      marker: { id: 993004033, title: "Toilet" },
    },
    formId: 976564018,
  },
};
