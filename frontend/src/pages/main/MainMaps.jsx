import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { Spin } from "antd";
import api from "../../util/api";
import { scaleQuantize } from "d3-scale";
import { UIState } from "../../state/ui";
import _ from "lodash";

const shapeLevels = ["UNIT_TYPE", "UNIT_NAME"];
const mapMaxZoom = 4;
const defCenter = [38.6682, 7.3942];
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];

const Markers = ({ data, colors }) => {
  data = data.filter((d) => d.geo);
  return data.map(({ id, geo, marker }) => {
    let fill = "#F00";
    if (colors) {
      fill = colors.find((c) => c.name === marker.toLowerCase());
      fill = fill ? fill.color : "#FF0";
    }
    return (
      <Marker key={id} coordinates={geo}>
        <circle r={3} fill={fill} stroke="#fff" strokeWidth={1} />
      </Marker>
    );
  });
};

const MainMaps = ({ geoUrl, question, current, mapHeight = 350 }) => {
  const { user, administration, selectedAdministration } = UIState.useState(
    (s) => s
  );
  const [position, setPosition] = useState({
    coordinates: defCenter,
    zoom: 1.8,
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const colors = question.find((q) => q.id === current.maps?.marker?.id)
    ?.option;

  useEffect(() => {
    setLoading(true);
    if (user && current) {
      let url = `maps/${current.formId}`;
      if (current.maps.shape) {
        url += `?shape=${current.maps.shape.id}`;
      }
      if (current.maps.shape) {
        url += `&marker=${current.maps.marker.id}`;
      }
      api
        .get(url)
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setLoading(false);
        });
    }
  }, [user, current]);

  const shapeColor = _.chain(_.groupBy(data, "loc"))
    .map((v, k) => {
      return {
        name: k,
        values: _.sumBy(v, "shape"),
      };
    })
    .value();

  const colorScale = scaleQuantize()
    .domain([
      _.minBy(shapeColor, "values")?.values,
      _.maxBy(shapeColor, "values")?.values,
    ])
    .range(colorRange);

  const adminName = administration.find(
    (a) => a.id === _.takeRight(selectedAdministration)[0]
  );
  const adminLevel = [false, ...shapeLevels][selectedAdministration.length - 1];

  const onShapeClick = (geoProp) => {
    const selectedShape = shapeLevels.map(
      (s) => administration.find((a) => a.name === geoProp[s])?.id
    );
    UIState.update((u) => {
      u.selectedAdministration = [null, ...selectedShape];
    });
  };

  return (
    <>
      {loading && (
        <div className="map-loading">
          <Spin />
        </div>
      )}
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
                let sc = shapeColor.find(
                  (s) =>
                    s.name ===
                    geo.properties[shapeLevels[shapeLevels.length - 1]]
                );
                if (adminLevel && adminName) {
                  sc =
                    geo.properties[adminLevel] === adminName.name ? sc : false;
                }
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onShapeClick(geo.properties)}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                    cursor="pointer"
                    style={{
                      default: {
                        fill: sc ? colorScale(sc.values || 0) : "#d3d3d3",
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
          {!loading && <Markers data={data} colors={colors} />}
        </ZoomableGroup>
      </ComposableMap>
    </>
  );
};

export default MainMaps;
