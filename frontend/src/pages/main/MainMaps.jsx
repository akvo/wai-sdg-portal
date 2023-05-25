import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  GeoJSON,
  Tooltip,
} from 'react-leaflet';
import { Spin, Button, Space, Badge, Slider, Row, Col, Select } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import api from '../../util/api';
import { scaleQuantize } from 'd3-scale';
import { UIState } from '../../state/ui';
import _ from 'lodash';
import { generateAdvanceFilterURL } from '../../util/utils';
import { getBounds, geojson, tileOSM, defaultPos } from '../../util/geo-util';
import { Color } from '../../chart/chart-style';
import PaginationApi from '../../components/PaginationApi';

const { shapeLevels } = window.map_config;
const mapMaxZoom = 14;
const defPos = defaultPos();
const colorRange = ['#bbedda', '#a7e1cb', '#92d5bd', '#7dcaaf', '#67bea1'];
const higlightColor = '#84b4cc';
const noDataColor = '#d3d3d3';

const Markers = ({
  data,
  colors,
  filterMarker,
  defaultColors,
  customHover,
}) => {
  const HoverContent = ({ marker, fill, name, customHover, hoverData }) => {
    if (!customHover) {
      return (
        <div className="marker-tooltip-container">
          <Badge
            count={marker}
            style={{ backgroundColor: fill }}
            size="small"
          />
          <h4>{name}</h4>
        </div>
      );
    }

    const content = customHover.map((x) => {
      const findData = hoverData?.find((d) => d?.id === x.id);
      const value = findData?.value || 'NA';
      return (
        <div
          key={`${x.name}-${x.id}`}
          className="marker-tooltip-wrapper"
        >
          <div className="marker-tooltip-title">{x.name}</div>
          <div className="marker-tooltip-value">{value}</div>
        </div>
      );
    });
    return (
      <div className="marker-tooltip-container">
        <Space direction="vertical">
          <Badge
            count={marker}
            size="small"
            style={{ backgroundColor: fill }}
          />
          {content}
        </Space>
      </div>
    );
  };

  data = data.filter((d) => d.geo);
  const rowHovered = UIState.useState((e) => e.rowHovered);
  return data.map(({ id, geo, marker, name, marker_hover }) => {
    let hovered = id === rowHovered;
    let fill = '#F00';
    const r = 3;
    const stroke = '#fff';
    if (marker && colors) {
      const option = colors.find(
        (c) => c?.name?.toLowerCase() === marker?.toLowerCase()
      );
      fill = option ? option.color : '#FF0';
      if (!fill) {
        fill = defaultColors?.find(
          (d) => d.name?.toLowerCase() === marker?.toLowerCase()
        )?.color;
      }
    }
    if (marker && filterMarker?.toLowerCase() === marker?.toLowerCase()) {
      hovered = true;
    }
    return (
      <Circle
        key={id}
        center={geo}
        pathOptions={{
          fillColor: hovered ? '#FFF' : fill,
          color: fill,
          opacity: 1,
          fillOpacity: 1,
        }}
        radius={r * 100 * (hovered ? 3 : 1)}
        stroke={stroke}
      >
        <Tooltip direction="top">
          <HoverContent
            marker={marker}
            fill={fill}
            name={name}
            customHover={customHover}
            hoverData={marker_hover}
          />
        </Tooltip>
      </Circle>
    );
  });
};

const ShapeLegendTitle = ({ current, shapeQuestion }) => {
  const title = current?.maps?.shape?.name || shapeQuestion?.name;
  const shapeLegendIsTitleByCalculated =
    current?.maps?.shape?.isTitleByCalculated;
  const extraTitle = current?.maps?.shape?.calculatedBy
    ? current.maps.shape.calculatedBy
        .map((s) => shapeQuestion?.option?.find((x) => x.id === s.id))
        .filter((x) => x)
    : [];
  return (
    <h4>
      {title}
      {shapeLegendIsTitleByCalculated &&
        extraTitle.map((x, xi) => (
          <div
            key={xi}
            className="extra-title"
          >
            {x?.color && (
              <span
                className="legend-icon"
                style={{ backgroundColor: x.color }}
              ></span>
            )}
            {x?.name}{' '}
            {xi + 1 !== extraTitle.length && extraTitle.length !== 1 && '+'}
          </div>
        ))}
    </h4>
  );
};

const ShapeLegend = ({
  data,
  domain,
  thresholds,
  filterColor,
  setFilterColor,
  shapeQuestion,
  current,
  updatedColorRange,
}) => {
  const shapeCalculationType = current?.maps?.shape?.type;
  const shapeLegendType = current?.maps?.shape?.legend;
  const shapeLegendColor = current?.maps?.shape?.color;
  const shapeLegendJmpType = current?.maps?.shape?.jmpType;
  const percentSuffix = shapeCalculationType === 'percentage' ? '%' : '';
  thresholds = Array.from(
    new Set(thresholds.map((x) => Math.round(Math.floor(x) / 10) * 10))
  );
  thresholds = thresholds.filter((x) => x !== 0);

  if (_.isEmpty(data) || !thresholds.length) {
    setFilterColor(null);
    return '';
  }

  if (shapeLegendType === 'slider') {
    return (
      <div className="legends-wrapper">
        {!_.isEmpty(shapeQuestion) && (
          <ShapeLegendTitle
            current={current}
            shapeQuestion={shapeQuestion}
          />
        )}
        <Slider
          range
          min={domain[0]}
          max={domain[1]}
          value={filterColor ? filterColor : domain}
          onChange={(val) => {
            setFilterColor(val);
          }}
          tipFormatter={(val) => `${val}${percentSuffix}`}
          className={`shape-legend-slider ${
            shapeLegendColor === 'jmp' && shapeLegendJmpType
              ? shapeLegendJmpType
              : ''
          }`}
        />
        <Row
          align="center"
          justify="space-between"
          className="slider-number-wrapper"
        >
          <Col>
            {domain[0]}
            {percentSuffix}
          </Col>
          <Col>
            {domain[1]}
            {percentSuffix}
          </Col>
        </Row>
      </div>
    );
  }

  const range = thresholds.map((x, i) => {
    return (
      <div
        key={`legend-${i + 1}`}
        className={
          'legend' +
          (filterColor !== null && filterColor === updatedColorRange[i]
            ? ' legend-selected'
            : '')
        }
        onClick={() => {
          filterColor === null
            ? setFilterColor(updatedColorRange[i])
            : filterColor === updatedColorRange[i]
            ? setFilterColor(null)
            : setFilterColor(updatedColorRange[i]);
        }}
        style={{
          backgroundColor:
            updatedColorRange[i] === filterColor
              ? higlightColor
              : updatedColorRange[i],
        }}
      >
        {i === 0 && x === 1
          ? x
          : i === 0
          ? `1${percentSuffix} - ${x}${percentSuffix}`
          : `${thresholds[i - 1]}${percentSuffix} - ${x}${percentSuffix}`}
      </div>
    );
  });

  if (thresholds.length) {
    return (
      <div className="legends-wrapper">
        {!_.isEmpty(shapeQuestion) && (
          <ShapeLegendTitle
            current={current}
            shapeQuestion={shapeQuestion}
          />
        )}
        <div className="legends">
          {[
            ...range,
            <div
              key={'legend-last'}
              className={
                'legend' +
                (filterColor !== null &&
                filterColor === updatedColorRange[range.length]
                  ? ' legend-selected'
                  : '')
              }
              style={{
                backgroundColor:
                  updatedColorRange[range.length] === filterColor
                    ? higlightColor
                    : updatedColorRange[range.length],
              }}
              onClick={() => {
                filterColor === null
                  ? setFilterColor(updatedColorRange[range.length])
                  : filterColor === updatedColorRange[range.length]
                  ? setFilterColor(null)
                  : setFilterColor(updatedColorRange[range.length]);
              }}
            >
              {'> '}
              {thresholds[thresholds.length - 1]}
              {percentSuffix}
            </div>,
          ]}
        </div>
      </div>
    );
  }
  return '';
};

const MarkerLegend = ({
  data,
  markerQuestion,
  filterMarker,
  setFilterMarker,
  renderSelectableMarker,
}) => {
  if (_.isEmpty(data)) {
    return '';
  }

  const option = _.sortBy(markerQuestion?.option)?.map((x, i) => (
    <Space
      key={`marker-legend-${x.name}-${i}`}
      size="small"
      align="center"
      className={
        'marker-item' +
        (filterMarker?.toLowerCase() === x.name?.toLowerCase()
          ? ' marker-item-selected'
          : '')
      }
      onClick={() =>
        filterMarker?.toLowerCase() === x.name?.toLowerCase()
          ? setFilterMarker(null)
          : setFilterMarker(x.name)
      }
    >
      <span
        className="marker-icon"
        style={{ backgroundColor: x.color || Color.color[i] }}
      ></span>
      <span className="marker-name">{x.name}</span>
    </Space>
  ));
  return (
    <div
      className={`marker-legends ${
        renderSelectableMarker ? 'dropdown-visible' : 'dropdown-hidden'
      }`}
    >
      <h4>{markerQuestion?.name?.toUpperCase() || 'Legend'}</h4>
      {option.map((o, i) => (
        <div
          key={i}
          className="marker-list"
        >
          {o}
        </div>
      ))}
    </div>
  );
};

const MainMaps = ({ question, current }) => {
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
  const [currentZoom, setCurrentZoom] = useState(null);
  const [filterColor, setFilterColor] = useState(null);
  const [filterMarker, setFilterMarker] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [hoveredShape, setHoveredShape] = useState(null);
  const [shapeTooltip, setShapeTooltip] = useState('');
  const [shapeQuestion, setShapeQuestion] = useState({});
  const [markerOptions, setMarkerOptions] = useState([]);
  const [preload, setPreload] = useState(true);
  const [totalPages, setTotalPages] = useState(null);

  // use tile layer from config
  const baseMap = window?.features?.mapFeature?.baseMap || tileOSM;

  // support selectable marker question
  const [markerQuestion, setMarkerQuestion] = useState(null);

  // support selectable marker question & custom color coded
  const defaultMarkerColor = _.sortBy(markerQuestion?.option)?.map((m, i) => ({
    ...m,
    color: m.color || Color.color[i],
  }));

  const handleOnChangeSelectableMarker = (qid) => {
    const findQuestion = markerOptions?.find((o) => o?.id === qid);
    setMarkerQuestion(findQuestion);
    if (!preload && !loading) {
      setPreload(true);
      setLoading(true);
    }
  };

  const PER_PAGE = 250;
  const { selectableMarkerDropdown, maps } = current || {};
  const { marker, shape } = maps || {};
  const mHovers =
    markerQuestion?.hover || selectableMarkerDropdown?.length
      ? selectableMarkerDropdown[0]?.hover
      : [];
  const mId = markerQuestion?.id || marker?.id;

  let url = `maps/${current?.formId}`;
  if (current?.maps?.shape) {
    url += `?shape=${current.maps.shape.id}`;
  }
  if (mId) {
    url += `&marker=${mId}`;
  }
  if (mHovers?.length) {
    const hoverIds = mHovers?.map((x) => x.id).join('|');
    url += `&hover_ids=${hoverIds}`;
  }
  url = generateAdvanceFilterURL(advanceSearchValue, url); // advance search

  useEffect(() => {
    if (
      user &&
      current &&
      loadedFormId !== null &&
      loadedFormId === current?.formId &&
      loading &&
      preload
    ) {
      setPreload(false);
      api
        .get(`${url}&page=1&perpage=${PER_PAGE}`)
        .then(({ data }) => {
          const { scores, data: apiData, total_page } = data;
          setTotalPages(total_page);
          const { calculatedBy, id: shapeId } = shape || {};
          if (selectableMarkerDropdown?.length) {
            const _markerOptions = selectableMarkerDropdown?.map((md) => {
              const fm =
                typeof md?.id === 'string'
                  ? scores?.find((s) => s?.name === md?.id)
                  : question?.find((q) => q?.id === md?.id);
              const mOptions = fm?.option || fm?.labels;
              return {
                ...fm,
                ...md,
                option: mOptions,
              };
            });
            setMarkerOptions(_markerOptions);
            const markerData = _markerOptions?.find((mo) => mo?.id === mId);
            const defaultSelectable = markerData || _markerOptions.shift();
            setMarkerQuestion(defaultSelectable);
          }
          let shapeData = question.find((q) => q.id === shapeId);
          let option = [];
          if (typeof shapeId === 'string') {
            option =
              scores?.find(
                (s) => s?.name?.toLowerCase() === shapeId?.toLowerCase()
              )?.labels || [];
            shapeData = {
              ...shapeData,
              option,
              type: 'option',
            };
          }

          setShapeQuestion(shapeData);
          let _data = apiData;
          if (calculatedBy) {
            const optionToCalculated =
              calculatedBy === 'all' || !calculatedBy.length
                ? option
                : option.filter((opt) =>
                    calculatedBy.map((x) => x.name).includes(opt?.name)
                  );
            _data = apiData.map((d) => {
              // find the option by shape === option name from optionToCalculated
              const findOption = optionToCalculated.find(
                (opt) => opt?.name?.toLowerCase() === d?.shape?.toLowerCase()
              );
              return {
                ...d,
                score: findOption
                  ? findOption?.score
                    ? findOption.score
                    : 1 // manage if score not defined
                  : 0,
              };
            });
          }
          setData(_data);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setLoading(false);
        });
    }
    if (!preload && !loading && loadedFormId !== current?.formId) {
      setShapeQuestion(null);
      setMarkerOptions([]);
      setMarkerQuestion(null);
      setLoading(true);
      setPreload(true);
    }
  }, [
    user,
    current,
    question,
    preload,
    loading,
    loadedFormId,
    advanceSearchValue,
    markerOptions,
    shapeQuestion,
    markerQuestion?.hover,
    markerQuestion?.id,
    selectableMarkerDropdown,
    shape,
    url,
    mId,
  ]);

  // shape config
  const shapeShadingType = current?.maps?.shape?.type;
  const shapeLegendType = current?.maps?.shape?.legend;
  const shapeLegendColor = current?.maps?.shape?.color;

  const jmpColorRange = _.orderBy(
    shapeQuestion?.option,
    ['order'],
    ['desc']
  )?.map((opt) => opt.color);
  const updatedColorRange =
    shapeLegendColor === 'jmp' && jmpColorRange.length
      ? jmpColorRange
      : colorRange;

  const shapeColor = _.chain(_.groupBy(data, 'loc'))
    .map((v, k) => {
      let values = _.sumBy(v, 'shape');
      // change shapeColor calculation if type described in config
      if (shapeShadingType === 'percentage') {
        const filterData = v.filter((x) => x.score);
        values = Math.round((filterData.length / v.length) * 100);
      }
      if (shapeShadingType === 'score') {
        values = _.sumBy(v, 'score');
      }
      return {
        name: k,
        values: values,
      };
    })
    .value();

  const domain =
    shapeShadingType === 'percentage'
      ? [0, 100]
      : shapeColor
          .reduce(
            (acc, curr) => {
              const v = curr.values;
              const [min, max] = acc;
              return [min, v > max ? v : max];
            },
            [0, 0]
          )
          .map((acc, index) => {
            if (index && acc) {
              acc = acc < 10 ? 10 : acc;
              const neaerestTo = Math.pow(
                10,
                Math.floor(Math.log(acc) / Math.log(10))
              );
              acc = Math.ceil(acc / neaerestTo) * neaerestTo;
            }
            return acc;
          });

  const colorScale = scaleQuantize().domain(domain).range(updatedColorRange);

  const adminLevel = [false, ...shapeLevels][selectedAdministration.length - 1];

  const adminName = administration.find(
    (a) => a.id === _.takeRight(selectedAdministration)[0]
  );

  const fillColor = (v) => {
    const color = v === 0 ? '#FFF' : colorScale(v);
    if (
      (!shapeLegendType || shapeLegendType !== 'slider') &&
      filterColor !== null
    ) {
      return filterColor === color ? higlightColor : color;
    }
    if (shapeLegendType === 'slider' && filterColor !== null) {
      const start = filterColor[0];
      const end = filterColor[1];
      return _.inRange(v, start, end) ? color : '#fff';
    }
    return color;
  };

  useEffect(() => {
    if (map && administration.length) {
      const pos = getBounds(selectedAdministration, administration);
      map.fitBounds(pos.bbox);
      setCurrentZoom(map.getZoom());
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

  useEffect(() => {
    // this is use to set the shape tooltip element by mouseover on leaflet maps
    if (hoveredShape && data.length && shapeQuestion) {
      const location =
        hoveredShape?.properties[shapeLevels[shapeLevels.length - 1]];
      if (!location) {
        setShapeTooltip(null);
        return;
      }
      const filteredData = data?.filter(
        (d) => d?.loc?.toLowerCase() === location?.toLowerCase()
      );
      let tooltipElement = '';
      if (shapeQuestion?.type === 'option') {
        let summaryData = _.chain(_.groupBy(filteredData, 'shape'))
          .map((v, k) => {
            const percent = Math.round((v.length / filteredData.length) * 100);
            return {
              name: k,
              value: `${percent}%`,
            };
          })
          .value();
        // map to options
        summaryData = shapeQuestion?.option?.map((opt) => {
          const findOption = summaryData.find(
            (s) => s.name.toLowerCase() === opt.name.toLowerCase()
          );
          return {
            ...opt,
            value: findOption ? findOption.value : '0%',
          };
        });
        summaryData = _.orderBy(summaryData, ['order']);
        tooltipElement = (
          <div className="shape-tooltip-container">
            <h4>{location}</h4>
            <Space direction="vertical">
              {summaryData?.map((x, i) => (
                <div
                  key={`${x.name}-${x.id}`}
                  className="shape-tooltip-wrapper"
                >
                  <span className="shape-tooltip-left-wrapper">
                    <span
                      className="shape-tooltip-icon"
                      style={{ backgroundColor: x.color || Color.color[i] }}
                    ></span>
                    <span className="shape-tooltip-name">{x.name}</span>
                  </span>
                  <span className="shape-tooltip-value">{x.value}</span>
                </div>
              ))}
            </Space>
          </div>
        );
      }
      if (shapeQuestion?.type !== 'option') {
        const summaryData = _.sumBy(filteredData, 'shape');
        tooltipElement = (
          <div className="shape-tooltip-container">
            <h4>{location}</h4>
            <Space direction="vertical">
              <div
                key={`${shapeQuestion.name}-${shapeQuestion.id}`}
                className="shape-tooltip-wrapper"
              >
                <span className="shape-tooltip-name">{shapeQuestion.name}</span>
                <span className="shape-tooltip-value">{summaryData}</span>
              </div>
            </Space>
          </div>
        );
      }
      setShapeTooltip(tooltipElement);
    }
  }, [hoveredShape, data, shapeQuestion]);

  const geoStyle = (g) => {
    const gname = g.properties[shapeLevels[shapeLevels.length - 1]];
    let sc = shapeColor.find((s) => s.name === gname);
    let opacity = 0.5;
    let color = '#00989f';
    if (adminLevel && adminName) {
      sc = g.properties[adminLevel] === adminName.name ? sc : false;
      opacity =
        g.properties[adminLevel] === adminName.name ? (sc ? 1 : 0.8) : 0.5;
      color = g.properties[adminLevel] === adminName.name ? '#000' : '#00989f';
    }

    if (adminName?.name === gname) {
      opacity = 1;
    }

    return {
      weight: opacity === 1 ? 2 : 1,
      fillColor: sc ? fillColor(sc.values || 0) : noDataColor,
      fillOpacity: sc ? 1 : opacity,
      opacity: 1,
      color: color,
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: ({ target }) => {
        setSelectedShape(target?.feature);
      },
      mouseover: ({ target }) => {
        setHoveredShape(target?.feature);
      },
    });
  };

  return (
    <div className="leaflet-container">
      {loading ? (
        <div className="map-loading">
          <Spin />
        </div>
      ) : (
        <>
          {/* support selectable marker question */}
          {/* Marker selectable dropdown */}
          {!_.isEmpty(markerOptions) && (
            <div className="marker-dropdown-container">
              <Select
                showSearch
                placeholder="Select here..."
                className="marker-select"
                options={markerOptions.map((q) => ({
                  label: q.name,
                  value: q.id,
                }))}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={markerQuestion?.id}
                onChange={handleOnChangeSelectableMarker}
              />
            </div>
          )}
          {/* EOL Marker selectable dropdown */}
          <ShapeLegend
            data={data}
            domain={domain}
            thresholds={colorScale.thresholds()}
            filterColor={filterColor}
            setFilterColor={setFilterColor}
            shapeQuestion={shapeQuestion}
            current={current}
            updatedColorRange={updatedColorRange}
          />
          <MarkerLegend
            data={data}
            markerQuestion={markerQuestion}
            filterMarker={filterMarker}
            setFilterMarker={setFilterMarker}
            renderSelectableMarker={!_.isEmpty(markerOptions)}
          />
        </>
      )}
      {map?._loaded && (
        <div className="map-buttons">
          <Space
            size="small"
            direction="vertical"
          >
            <Button
              type="secondary"
              icon={<FullscreenOutlined />}
              onClick={() => {
                map.fitBounds(defPos.bbox);
                setCurrentZoom(map.getZoom());
              }}
            />
            <Button
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
      {administration.length && (
        <MapContainer
          bounds={defPos.bbox}
          whenCreated={setMap}
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
            style={geoStyle}
            data={geojson}
            onEachFeature={onEachFeature}
          >
            {hoveredShape && shapeTooltip && <Tooltip>{shapeTooltip}</Tooltip>}
          </GeoJSON>
          {!loading && (
            <Markers
              data={data}
              colors={markerQuestion?.option}
              defaultColors={defaultMarkerColor}
              filterMarker={filterMarker}
              customHover={markerQuestion?.hover}
            />
          )}
        </MapContainer>
      )}
      {api.token && totalPages && !loading && (
        <PaginationApi
          apiUrl={url}
          totalPages={totalPages}
          perPage={PER_PAGE}
          callback={(res) => {
            setData([...data, ...res]);
          }}
        />
      )}
    </div>
  );
};

export default MainMaps;
