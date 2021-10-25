import reverse from "lodash/reverse";

export const getLocationName = (id, locations, result = []) => {
  const loc = locations.find((l) => l.id === id);
  result = loc?.name ? [...result, loc?.name] : result;
  if (loc?.parent) {
    return getLocationName(loc?.parent, locations, result);
  }
  return reverse(result).join(" - ");
};
