import { reverse, isEmpty, startCase, toLower, takeRight } from 'lodash';

const currencyFormatter = require('currency-formatter');

export const getLocationName = (id, locations, result = []) => {
  const loc = locations.find((l) => l.id === id);
  result = loc?.name ? [...result, loc?.name] : result;
  if (loc?.parent) {
    return getLocationName(loc?.parent, locations, result);
  }
  return reverse(result).join(' - ');
};

export const generateAdvanceFilterURL = (advanceSearchValue, url) => {
  // advance search
  if (!isEmpty(advanceSearchValue)) {
    const queryUrlPrefix = url.includes('?') ? '&' : '?';
    advanceSearchValue = advanceSearchValue.map((x) => {
      if (x.type === 'answer_list') {
        const option = x.option.map((o) => {
          const oSplit = o.split(' ');
          const qId = o.split('|')[0];
          const oVal = takeRight(oSplit)[0];
          return `${qId}|${oVal}`;
        });
        return { ...x, option };
      }
      return x;
    });
    const advanceFilter = advanceSearchValue
      .flatMap((x) => x.option)
      .map((x) => encodeURIComponent(x))
      .join('&q=');
    url += `${queryUrlPrefix}q=${advanceFilter?.toLowerCase()}`;
  }
  return url;
};

export const formatNumber = (x) => {
  return currencyFormatter.format(x, {
    decimal: '.',
    thousand: ',',
    precision: 0,
    format: '%v',
  });
};

export const titleCase = (str) => {
  return startCase(toLower(str));
};
