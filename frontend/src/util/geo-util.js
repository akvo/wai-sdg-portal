import { feature } from "topojson-client";
import { geoCentroid, geoBounds } from "d3-geo";
import { takeRight } from "lodash";
import { merge } from "topojson-client";

const topojson = window.topojson;
const geo = topojson.objects[Object.keys(topojson.objects)[0]];
const shapeLevels = window.map_config.shapeLevels;

export const getBounds = (selected, administration) => {
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
  const center = geoCentroid(mergeTopo).reverse();
  const bounds = geoBounds(mergeTopo);
  const bbox = [bounds[0].reverse(), bounds[1].reverse()];
  return {
    coordinates: center,
    bbox: bbox,
  };
};

export const defaultPos = () => {
  const mergeTopo = merge(topojson, geo.geometries);
  const center = geoCentroid(mergeTopo).reverse();
  const bounds = geoBounds(mergeTopo);
  const bbox = [bounds[0].reverse(), bounds[1].reverse()];
  return {
    coordinates: center,
    bbox: bbox,
  };
};

export const geojson = feature(topojson, geo);

export const tile = {
  url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

export const tileOSM = {
  url:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
};

export const tileStadia = {
  url:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri",
};

export const tileAlidade = {
  url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
};
