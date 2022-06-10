import React, { useEffect } from "react";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import { defaultPos, geojson, tileStadia } from "../util/geo-util";
import { UIState } from "../state/ui";

const defPos = defaultPos();
const landingPos = window?.landing_map_pos || 0.6;

const Map = () => {
  const { boundsAlignToRight } = UIState.useState((s) => s);
  const newBbox = boundsAlignToRight
    ? boundsAlignToRight
    : defPos.bbox.map((x) => {
        x[1] = x[1] - landingPos;
        return x;
      });

  useEffect(() => {
    if (!boundsAlignToRight) {
      UIState.update((u) => {
        u.boundsAlignToRight = newBbox;
      });
    }
  }, [boundsAlignToRight, newBbox]);

  return (
    <div className="map-container">
      <MapContainer
        bounds={newBbox}
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
