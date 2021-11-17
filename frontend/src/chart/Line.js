import { Easing, Color, TextStyle, backgroundColor } from "./chart-style.js";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";

const Line = (data, extra) => {
  const qtype = data[0]?.type;
  let values = [];
  let labels = [];
  data = !data ? [] : data;
  if (data.length > 0) {
    data = sortBy(data, "date");
    values = data.map((x) => x.value || x.name);
    labels = data.map((x) => x.date);
  }
  let yAxisVal = {
    type: "value",
  };
  if (qtype === "option") {
    yAxisVal = {
      type: "category",
      data: uniq(values),
    };
  }
  const text_style = TextStyle;
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
        ...text_style,
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
    },
    yAxis: yAxisVal,
    series: [
      {
        data: values,
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
