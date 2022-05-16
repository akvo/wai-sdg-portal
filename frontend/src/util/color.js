/* eslint-disable no-useless-computed-key */
export const JMPColor = {
  sanitation: {
    basic: "#ddd",
    advanced: "#ddd",
    someothername: "#ddd",
  },
  health: {
    somethingelse: "#ddd",
  },
};

export const OtherNameColor = {
  test: "#ccc",
};

export const getLuma = (c) => {
  if (!c) {
    return "#000";
  }
  c = c.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 200 ? "#fff" : "#000";
};

export const defaultColor = [
  {
    name: "Water service level",
    options: [
      {
        name: "Safely Managed",
        color: "#297EB5",
      },
      {
        name: "Basic",
        color: "#5EBADF",
      },
      {
        name: "Limited",
        color: "#FDF177",
      },
      {
        name: "Unimproved",
        color: "#FBD256",
      },
      {
        name: "Surface water",
        color: "#F1AC2A",
      },
      {
        name: "No Service",
        color: "#F9CA29",
      },
    ],
  },
  {
    name: "Sanitation service level",
    options: [
      {
        name: "Safely Managed",
        color: "#368541",
      },
      {
        name: "Basic",
        color: "#79BE7D",
      },
      {
        name: "Limited",
        color: "#FDF177",
      },
      {
        name: "Unimproved",
        color: "#FBD256",
      },
      {
        name: "Open Defecation",
        color: "#F1AC2A",
      },
      {
        name: "No Service",
        color: "#F9CA29",
      },
    ],
  },
  {
    name: "Hygiene service level",
    options: [
      {
        name: "Basic",
        color: "#753780",
      },
      {
        name: "Limited",
        color: "#FDF177",
      },
      {
        name: "No Facility",
        color: "#F1AC2A",
      },
      {
        name: "No Service",
        color: "#F9CA29",
      },
    ],
  },
  {
    name: "Toilet",
    options: [
      {
        name: "Yes",
        color: "#4475B4",
      },
      {
        name: "No",
        color: "#73ADD1",
      },
    ],
  },
  {
    name: "Handwashing",
    options: [
      {
        name: "Yes",
        color: "#4475B4",
      },
      {
        name: "No",
        color: "#73ADD1",
      },
    ],
  },
];

export const generateColors = (column) => {
  const col = column.map((c) => {
    const colors = defaultColor.find((clr) => {
      return clr.name.toLocaleLowerCase().includes(c.title.toLocaleLowerCase());
    });
    const option = colors?.options;
    return {
      ...c,
      values: option,
    };
  });
  return col;
};
