import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  GeoJSON,
  Tooltip,
} from "react-leaflet";
import { Spin, Button, Space, Badge } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import api from "../../util/api";
import { scaleQuantize } from "d3-scale";
import { UIState } from "../../state/ui";
import _ from "lodash";
import { generateAdvanceFilterURL } from "../../util/utils";
import { centeroid, geojson, tile, defaultPos } from "../../util/geo-util";

const { shapeLevels } = window.map_config;
const mapMaxZoom = 12;
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];
const higlightColor = "#84b4cc";
const noDataColor = "#d3d3d3";

const Markers = ({ data, colors, filterMarker }) => {
  data = data.filter((d) => d.geo);
  const rowHovered = UIState.useState((e) => e.rowHovered);
  return data.map(({ id, geo, marker, name }) => {
    const hovered = id === rowHovered;
    let fill = "#F00";
    let r = 3;
    let stroke = "#fff";
    if (colors) {
      const option = colors.find((c) => c.name === marker?.toLowerCase());
      fill = option ? option.color : "#FF0";
    }
    if (filterMarker === marker?.toLowerCase()) {
      r = 4;
      stroke = "#000";
    }
    return (
      <Circle
        key={id}
        center={geo}
        pathOptions={{
          fillColor: hovered ? "#FFF" : fill,
          color: fill,
          opacity: 1,
          fillOpacity: 1,
        }}
        radius={r * 100 * (hovered ? 3 : 1)}
        stroke={stroke}
      >
        <Tooltip direction="top">
          <Badge count={marker} style={{ backgroundColor: fill }} /> {name}
        </Tooltip>
      </Circle>
    );
  });
};

const ShapeLegend = ({
  data,
  thresholds,
  filterColor,
  setFilterColor,
  shapeQuestion,
}) => {
  if (_.isEmpty(data)) {
    return "";
  }

  thresholds = Array.from(
    new Set(thresholds.map((x) => Math.round(Math.floor(x) / 10) * 10))
  );
  thresholds = thresholds.filter((x) => x !== 0);
  const range = thresholds.map((x, i) => {
    return (
      <div
        key={`legend-${i + 1}`}
        className={
          "legend" +
          (filterColor !== null && filterColor === colorRange[i]
            ? " legend-selected"
            : "")
        }
        onClick={(e) => {
          filterColor === null
            ? setFilterColor(colorRange[i])
            : filterColor === colorRange[i]
            ? setFilterColor(null)
            : setFilterColor(colorRange[i]);
        }}
        style={{
          backgroundColor:
            colorRange[i] === filterColor ? higlightColor : colorRange[i],
        }}
      >
        {i === 0 && x === 1
          ? x
          : i === 0
          ? "1 - " + x
          : thresholds[i - 1] + " - " + x}
      </div>
    );
  });

  if (thresholds.length) {
    return (
      <div className="legends-wrapper">
        {!_.isEmpty(shapeQuestion) && (
          <h4>{shapeQuestion?.name?.toUpperCase()}</h4>
        )}
        <div className="legends">
          {[
            ...range,
            <div
              key={"legend-last"}
              className={
                "legend" +
                (filterColor !== null &&
                filterColor === colorRange[range.length]
                  ? " legend-selected"
                  : "")
              }
              style={{
                backgroundColor:
                  colorRange[range.length] === filterColor
                    ? higlightColor
                    : colorRange[range.length],
              }}
              onClick={(e) => {
                filterColor === null
                  ? setFilterColor(colorRange[range.length])
                  : filterColor === colorRange[range.length]
                  ? setFilterColor(null)
                  : setFilterColor(colorRange[range.length]);
              }}
            >
              {"> "}
              {thresholds[thresholds.length - 1]}
            </div>,
          ]}
        </div>
      </div>
    );
  }
  return "";
};

const MarkerLegend = ({
  data,
  markerQuestion,
  filterMarker,
  setFilterMarker,
}) => {
  if (_.isEmpty(data)) {
    return "";
  }

  const option = _.sortBy(markerQuestion?.option)?.map((x, i) => (
    <Space
      key={`marker-legend-${x.name}-${i}`}
      size="small"
      align="center"
      className={
        "marker-item" + (filterMarker === x.name ? " marker-item-selected" : "")
      }
      onClick={() =>
        filterMarker === x.name
          ? setFilterMarker(null)
          : setFilterMarker(x.name)
      }
    >
      <span
        className="marker-icon"
        style={{ backgroundColor: x.color || "#000" }}
      ></span>
      <span className="marker-name">{_.capitalize(x.name)}</span>
    </Space>
  ));
  return (
    <div className="marker-legends">
      <h4>{markerQuestion?.name?.toUpperCase() || "Legend"}</h4>
      {option.map((o, i) => (
        <div key={i} className="marker-list">
          {o}
        </div>
      ))}
    </div>
  );
};

const MainMaps = ({ question, current, mapHeight = 350 }) => {
  const {
    user,
    administration,
    selectedAdministration,
    advanceSearchValue,
    loadedFormId,
  } = UIState.useState((s) => s);
  const [map, setMap] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(defaultPos.zoom);
  const [filterColor, setFilterColor] = useState(null);
  const [filterMarker, setFilterMarker] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const markerQuestion = question.find(
    (q) => q.id === current.maps?.marker?.id
  );
  const shapeQuestion = question.find((q) => q.id === current.maps?.shape?.id);

  useEffect(() => {
    setLoading(true);
    if (
      user &&
      current &&
      loadedFormId !== null &&
      loadedFormId === current?.formId
    ) {
      let url = `maps/${current.formId}`;
      if (current.maps.shape) {
        url += `?shape=${current.maps.shape.id}`;
      }
      if (current.maps.shape) {
        url += `&marker=${current.maps.marker.id}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
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
  }, [user, current, loadedFormId, advanceSearchValue]);

  const shapeColor = _.chain(_.groupBy(data, "loc"))
    .map((v, k) => {
      return {
        name: k,
        values: _.sumBy(v, "shape"),
      };
    })
    .value();

  const domain = shapeColor.reduce(
    (acc, curr) => {
      const v = curr.values;
      const [min, max] = acc;
      return [min, v > max ? v : max];
    },
    [0, 0]
  );

  const colorScale = scaleQuantize().domain(domain).range(colorRange);

  const adminName = administration.find(
    (a) => a.id === _.takeRight(selectedAdministration)[0]
  );
  const adminLevel = [false, ...shapeLevels][selectedAdministration.length - 1];

  const fillColor = (v) => {
    const color = v === 0 ? noDataColor : colorScale(v);
    if (filterColor !== null) {
      return filterColor === color ? higlightColor : color;
    }
    return color;
  };

  useEffect(() => {
    if (map && administration.length) {
      const pos = centeroid(selectedAdministration, administration);
      map.setView(pos.coordinates, pos.zoom);
      setCurrentZoom(pos.zoom);
    }
  }, [map, administration, selectedAdministration]);

  useEffect(() => {
    if (selectedShape && administration.length) {
      const selected = shapeLevels.map(
        (s) =>
          administration.find((a) => a.name === selectedShape?.properties?.[s])
            ?.id
      );
      UIState.update((u) => {
        u.selectedAdministration = [null, ...selected];
      });
    }
  }, [selectedShape, administration]);

  const geoStyle = (g) => {
    let sc = shapeColor.find(
      (s) => s.name === g.properties[shapeLevels[shapeLevels.length - 1]]
    );
    if (adminLevel && adminName) {
      sc = g.properties[adminLevel] === adminName.name ? sc : false;
    }

    return {
      weight: 1,
      fillColor: sc ? fillColor(sc.values || 0) : noDataColor,
      fillOpacity: sc ? 1 : 0.5,
      opacity: 1,
      color: "#00989f",
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: ({ target }) => {
        setSelectedShape(target?.feature);
      },
    });
  };

  return (
    <div className="leaflet-container">
      {loading && (
        <div className="map-loading">
          <Spin />
        </div>
      )}
      <ShapeLegend
        data={data}
        thresholds={colorScale.thresholds()}
        filterColor={filterColor}
        setFilterColor={setFilterColor}
        shapeQuestion={shapeQuestion}
      />
      <MarkerLegend
        data={data}
        markerQuestion={markerQuestion}
        filterMarker={filterMarker}
        setFilterMarker={setFilterMarker}
      />
      {map?._loaded && (
        <div className="map-buttons">
          <Space size="small" direction="vertical">
            <Button
              type="secondary"
              icon={<FullscreenOutlined />}
              onClick={() => {
                map.setView(defaultPos.coordinates, defaultPos.zoom);
                setCurrentZoom(defaultPos.zoom);
              }}
            />
            <Button
              disabled={currentZoom <= defaultPos.zoom}
              type="secondary"
              icon={<ZoomOutOutlined />}
              onClick={() => {
                const current = map.getZoom() - 1;
                map.setZoom(current);
                setCurrentZoom(current);
              }}
            />
            <Button
              disabled={currentZoom >= mapMaxZoom}
              type="secondary"
              icon={<ZoomInOutlined />}
              onClick={() => {
                const current = map.getZoom() + 1;
                map.setZoom(current);
                setCurrentZoom(current);
              }}
            />
          </Space>
        </div>
      )}
      <MapContainer
        center={defaultPos.coordinates}
        zoom={defaultPos.zoom}
        whenCreated={setMap}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer {...tile} />
        <GeoJSON
          key="geodata"
          style={geoStyle}
          data={geojson}
          onEachFeature={onEachFeature}
        />
        {!loading && (
          <Markers
            data={data}
            colors={markerQuestion?.option}
            filterMarker={filterMarker}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MainMaps;
