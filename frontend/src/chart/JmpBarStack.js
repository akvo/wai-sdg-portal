import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  AxisLabelFormatter,
  Legend,
  Title,
} from "./chart-style.js";
import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";

const JmpBarStack = (data, chartTitle, extra) => {
  if (isEmpty(data) || !data) {
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

  const { selectedAdministration } = extra;
  // filter only data with stack
  data = sortBy(
    data.filter((d) => !isEmpty(d.stack)),
    ["score"]
  );

  let stacked = data
    .find((d) => !isEmpty(d.stack))
    .stack.map((x) => ({ name: x.name, color: x.color }));
  let legends = stacked.map((s, si) => ({
    name: s.name,
    itemStyle: { color: s.color || Color.color[si] },
  }));
  let xAxis = uniq(data.map((x) => x.name));
  let series = stacked.map((s) => {
    const temp = data.map((d, di) => {
      const val = d.stack.find((c) => c.name === s.name);
      const opacity = selectedAdministration === d.id ? 1 : 0.5;
      return {
        name: val?.name || null,
        value: val?.value || 0,
        itemStyle: {
          color: val?.color || s.color,
          opacity: selectedAdministration ? opacity : 1,
        },
      };
    });
    return {
      name: s.name,
      type: "bar",
      stack: "count",
      // label: {
      //   colorBy: "data",
      //   position: "insideLeft",
      //   show: true,
      //   padding: 5,
      //   backgroundColor: "rgba(0,0,0,.3)",
      //   ...TextStyle,
      //   color: "#fff",
      // },
      emphasis: {
        focus: "series",
      },
      data: temp,
    };
  });
  let option = {
    ...Color,
    title: {
      ...Title,
      show: !isEmpty(chartTitle),
      text: chartTitle?.title,
      subtext: chartTitle?.subTitle,
    },
    legend: {
      ...Legend,
      data: legends,
      top: "top",
      left: "center",
    },
    grid: {
      top: "10%",
      show: true,
      label: {
        color: "#222",
        ...TextStyle,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "#ffffff",
      ...TextStyle,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        color: "#222",
        ...TextStyle,
        ...AxisLabelFormatter,
      },
      axisTick: {
        alignWithLabel: true,
      },
      max: function (value) {
        return value.max;
      },
    },
    yAxis: {
      data: xAxis,
      type: "category",
    },
    series: series,
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default JmpBarStack;
