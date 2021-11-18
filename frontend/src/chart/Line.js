import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Title,
} from "./chart-style.js";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";

const Line = (data, chartTitle, extra) => {
  if (isEmpty(data)) {
    return {
      title: {
        text: "No Data",
        subtext: "",
        left: "center",
        top: "20px",
        ...TextStyle,
      },
    };
  }
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
      top: "15%",
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
