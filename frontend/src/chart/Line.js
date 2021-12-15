import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Title,
  AxisLabelFormatter,
  NoData,
} from "./chart-style.js";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";
import moment from "moment";

const Line = (data, chartTitle, extra) => {
  if (isEmpty(data)) {
    return NoData;
  }
  let yAxisVal = [];
  let labels = [];
  let seriesData = [];
  data = !data ? [] : data;
  data = data.map((x) => ({
    ...x,
    moment: x?.date ? moment(x?.date, "MMMM DD,YYYY").toDate() : false,
  }));
  if (data.length > 0) {
    yAxisVal = data?.map((x) => x.value || x.name);
    yAxisVal = uniq(sortBy(yAxisVal).filter((x) => x));
    data = sortBy(data, "moment").filter((d) => d?.moment); // show only data have date
    seriesData = data.map((x) => x.value || x.name);
    labels = data.map((x) => x.date);
    seriesData = seriesData.map((x) => String(x));
  }
  let option = {
    title: {
      ...Title,
      show: !isEmpty(chartTitle),
      text: chartTitle?.title,
      subtext: chartTitle?.subTitle,
    },
    tooltip: {
      trigger: "axis",
    },
    grid: {
      top: "25%",
      bottom: "23%",
      containLabel: true,
      label: {
        color: "#222",
        ...TextStyle,
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
    },
    yAxis: {
      type: "category",
      data: yAxisVal,
      axisLabel: {
        ...AxisLabelFormatter,
      },
    },
    series: [
      {
        data: seriesData,
        type: "line",
      },
    ],
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default Line;
