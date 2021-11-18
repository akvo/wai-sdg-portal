import { Easing, Color, TextStyle, backgroundColor } from "./chart-style.js";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";

const Line = (data, extra) => {
  let yAxisVal = [];
  let labels = [];
  let seriesData = [];
  data = !data ? [] : data;
  if (data.length > 0) {
    data = sortBy(data, "date");
    seriesData = data.map((x) => x.value || x.name);
    yAxisVal = uniq(sortBy(seriesData).filter((x) => x));
    labels = data.map((x) => x.date);
    seriesData = seriesData.map((x) => String(x));
  }
  let option = {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      top: "10px",
      left: "10%",
      right: "10%",
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
