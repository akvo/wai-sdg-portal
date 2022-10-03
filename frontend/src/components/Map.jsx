import React, { useEffect } from 'react';
import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
import { defaultPos, geojson, tileOSM } from '../util/geo-util';
import { UIState } from '../state/ui';

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

  // use tile layer from config
  const baseMap = window?.features?.mapFeature?.baseMap || tileOSM;

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
          height: '100%',
          width: '100%',
        }}
      >
        <TileLayer {...baseMap} />
        <GeoJSON
          key="geodata"
          style={{
            weight: 2,
            fillColor: '#00989f',
            fillOpacity: 0.5,
            opacity: 0.5,
            color: '#FFF',
          }}
          data={geojson}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
