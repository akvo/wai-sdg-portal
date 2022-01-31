import React from "react";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import { defaultPos, geojson, tileStadia } from "../util/geo-util";

const defPos = defaultPos();

const Map = () => {
  const boundsAlignToRight = defPos.bbox.map((x) => {
    x[1] = x[1] - 0.6;
    return x;
  });
  return (
    <div className="map-container">
      <MapContainer
        bounds={boundsAlignToRight}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer {...tileStadia} />
        <GeoJSON
          key="geodata"
          style={{
            weight: 2,
            fillColor: "#00989f",
            fillOpacity: 0.5,
            opacity: 0.5,
            color: "#FFF",
          }}
          data={geojson}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
