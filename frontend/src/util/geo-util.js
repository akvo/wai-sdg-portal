import { feature } from "topojson-client";
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
    coordinates: center.reverse(),
    zoom: selected.length + 10,
  };
};

export const defaultPos = {
  coordinates: geoCentroid(merge(topojson, geo.geometries)).reverse(),
  zoom: 10,
};

export const geojson = feature(topojson, geo);

export const tile = {
  url:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
};
