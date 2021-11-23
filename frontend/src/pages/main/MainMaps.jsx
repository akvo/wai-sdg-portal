import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { Spin, Tooltip, Button, Space, Row, Col } from "antd";
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
import { centeroid, defaultPos } from "../../util/geo-util";

const { shapeLevels } = window.map_config;
const mapMaxZoom = 4;
const colorRange = ["#bbedda", "#a7e1cb", "#92d5bd", "#7dcaaf", "#67bea1"];
const higlightColor = "#84b4cc";
const noDataColor = "#d3d3d3";

const Markers = ({ data, colors, filterMarker }) => {
  data = data.filter((d) => d.geo);
  return data.map(({ id, geo, marker }) => {
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
      <Marker key={id} coordinates={geo}>
        <circle r={r} fill={fill} stroke={stroke} strokeWidth={1} />
      </Marker>
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
            <div
              key={"legend-0"}
              className={
                "legend" +
                (filterColor !== null && filterColor === noDataColor
                  ? " legend-selected"
                  : "")
              }
              style={{
                backgroundColor:
                  noDataColor === filterColor ? higlightColor : noDataColor,
              }}
              onClick={(e) => {
                filterColor === null
                  ? setFilterColor(noDataColor)
                  : filterColor === noDataColor
                  ? setFilterColor(null)
                  : setFilterColor(noDataColor);
              }}
            >
              0
            </div>,
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
      <span className="marker-name">{_.capitalize(x.name)}</span>
      <span
        className="marker-icon"
        style={{ backgroundColor: x.color || "#000" }}
      ></span>
    </Space>
  ));
  return (
    <Row className="marker-legends">
      <Col align="end" span={24}>
        <h4>{markerQuestion?.name?.toUpperCase() || "Legend"}</h4>
      </Col>
      <Col align="end" span={24}>
        <Space size="small" direction="vertical" align="end">
          {option}
        </Space>
      </Col>
    </Row>
  );
};

const MainMaps = ({ question, current, mapHeight = 350 }) => {
  const {
    user,
    administration,
    selectedAdministration,
    advanceSearchValue,
  } = UIState.useState((s) => s);
  const [position, setPosition] = useState(defaultPos);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterColor, setFilterColor] = useState(null);
  const [filterMarker, setFilterMarker] = useState(null);
  const markerQuestion = question.find(
    (q) => q.id === current.maps?.marker?.id
  );
  const shapeQuestion = question.find((q) => q.id === current.maps?.shape?.id);

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
  }, [user, current, advanceSearchValue]);

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

  const onShapeClick = (geoProp) => {
    const selectedShape = shapeLevels.map(
      (s) => administration.find((a) => a.name === geoProp[s])?.id
    );
    UIState.update((u) => {
      u.selectedAdministration = [null, ...selectedShape];
    });
  };

  const fillColor = (v) => {
    const color = v === 0 ? noDataColor : colorScale(v);
    if (filterColor !== null) {
      return filterColor === color ? higlightColor : color;
    }
    return color;
  };

  useEffect(() => {
    setPosition(centeroid(selectedAdministration, administration));
  }, [administration, selectedAdministration]);

  return (
    <>
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
      <div className="map-buttons">
        <Space size="small" direction="vertical">
          <Tooltip title="reset zoom">
            <Button
              type="secondary"
              icon={<FullscreenOutlined />}
              onClick={() => {
                setPosition(defaultPos);
              }}
            />
          </Tooltip>
          <Tooltip title="zoom out">
            <Button
              type="secondary"
              icon={<ZoomOutOutlined />}
              onClick={() => {
                position.zoom > 1 &&
                  setPosition({ ...position, zoom: position.zoom - 0.5 });
              }}
              disabled={position.zoom <= 1}
            />
          </Tooltip>
          <Tooltip title="zoom in">
            <Button
              disabled={position.zoom >= mapMaxZoom}
              type="secondary"
              icon={<ZoomInOutlined />}
              onClick={() => {
                setPosition({ ...position, zoom: position.zoom + 0.5 });
              }}
            />
          </Tooltip>
        </Space>
      </div>
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
                        fill: sc ? fillColor(sc.values || 0) : noDataColor,
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
          {!loading && (
            <Markers
              data={data}
              colors={markerQuestion?.option}
              filterMarker={filterMarker}
            />
          )}
        </ZoomableGroup>
      </ComposableMap>
    </>
  );
};

export default MainMaps;
