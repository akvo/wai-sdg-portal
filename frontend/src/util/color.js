/* eslint-disable no-useless-computed-key */
export const JMPColor = {
  sanitation: {
    basic: '#ddd',
    advanced: '#ddd',
    someothername: '#ddd',
  },
  health: {
    somethingelse: '#ddd',
  },
};

export const OtherNameColor = {
  test: '#ccc',
};

export const getLuma = (c) => {
  if (!c) {
    return '#000';
  }
  c = c.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 200 ? '#fff' : '#000';
};
