import { geoCentroid } from "d3-geo";
import { takeRight } from "lodash";
import { merge } from "topojson-client";

const topojson = window.topojson;
const geo = topojson.objects[Object.keys(topojson.objects)[0]];
const shapeLevels = window.map_config.shapeLevels;

export const centeroid = (selected, administration) => {
  selected = takeRight(selected, selected.length - 1);
  selected = selected.map((x, i) => {
    const adminName = administration?.find((a) => a.id === x)?.name;
    return {
      value: adminName,
      prop: shapeLevels[i],
    };
  });
  const geoFilter = geo.geometries.filter((x) => {
    let filters = [];
    selected.forEach((s) => {
      if (x?.properties?.[s.prop] === s.value) {
        filters.push(true);
      } else {
        filters.push(false);
      }
    });
    return filters?.filter((f) => f).length === selected.length;
  });
  const mergeTopo = merge(
    topojson,
    geoFilter.length ? geoFilter : geo.geometries
  );
  const center = geoCentroid(mergeTopo);
  return {
    coordinates: center,
    zoom: 1.75 * (selected.length + 1),
  };
};

export const defaultPos = {
  coordinates: geoCentroid(merge(topojson, geo.geometries)),
  zoom: 1.75,
};
