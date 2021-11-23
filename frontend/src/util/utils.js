import reverse from "lodash/reverse";
import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";
import toLower from "lodash/toLower";

const currencyFormatter = require("currency-formatter");

export const getLocationName = (id, locations, result = []) => {
  const loc = locations.find((l) => l.id === id);
  result = loc?.name ? [...result, loc?.name] : result;
  if (loc?.parent) {
    return getLocationName(loc?.parent, locations, result);
  }
  return reverse(result).join(" - ");
};

export const generateAdvanceFilterURL = (advanceSearchValue, url) => {
  // advance search
  if (!isEmpty(advanceSearchValue)) {
    const advanceFilter = advanceSearchValue
      .map((x) => encodeURIComponent(x.option))
      .join("&q=");
    url += `&q=${advanceFilter}`;
  }
  return url;
};

export const formatNumber = (x) => {
  return currencyFormatter.format(x, {
    decimal: ".",
    thousand: ",",
    precision: 0,
    format: "%v",
  });
};

export const titleCase = (str) => {
  return startCase(toLower(str));
};
