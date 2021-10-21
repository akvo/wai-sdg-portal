import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";

const mapMaxZoom = 4;
const defCenter = [38.6682, 7.3942];
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];

const Markers = ({ data, colors }) => {
  data = data.filter((d) => d.geo);
  return data.map(({ id, geo, color_by }) => {
    let fill = "#F00";
    if (colors) {
      fill = colors.find((c) => c.name === color_by.toLowerCase());
      fill = fill ? fill.color : "#FF0";
    }
    return (
      <Marker key={id} coordinates={geo}>
        <circle r={3} fill={fill} stroke="#fff" strokeWidth={1} />
      </Marker>
    );
  });
};

const MainMaps = ({
  geoUrl,
  question,
  loading,
  data,
  current,
  mapHeight = 350,
}) => {
  const [position, setPosition] = useState({
    coordinates: defCenter,
    zoom: 1.8,
  });
  const colors = question?.[0].question.find(
    (q) => q.id === current.maps?.marker?.id
  )?.option;

  return (
    <ComposableMap
      data-tip=""
      projection="geoEquirectangular"
      height={mapHeight}
      projectionConfig={{ scale: 25000 }}
    >
      <ZoomableGroup
        filterZoomEvent={(evt) => {
          return evt.type === "wheel" ? false : true;
        }}
        maxZoom={mapMaxZoom}
        zoom={position.zoom}
        center={position.coordinates}
        onMoveEnd={(x) => {
          setPosition(x);
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  strokeOpacity="0.6"
                  cursor="pointer"
                  style={{
                    default: {
                      fill: "#d3d3d3",
                      outline: "none",
                    },
                    hover: {
                      fill: "#FCF176",
                      outline: "none",
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
        <Markers data={data} colors={colors} />
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default MainMaps;
