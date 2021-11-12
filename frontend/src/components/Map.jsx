import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const mapMaxZoom = 4;
const defCenter = [38.6682, 7.3942];

const Map = ({ mapHeight = 350 }) => {
  const [position, setPosition] = useState({
    coordinates: defCenter,
    zoom: 1.8,
  });

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
        <Geographies geography={window.topojson}>
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
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default Map;
