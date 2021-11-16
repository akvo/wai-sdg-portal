import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  AxisLabelFormatter,
} from "./chart-style.js";
import uniq from "lodash/uniq";
import flatten from "lodash/flatten";
import isEmpty from "lodash/isEmpty";

const BarStack = (data, extra) => {
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
  let stacked = uniq(flatten(data.map((x) => x.stack.map((y) => y.name))));
  let legends = stacked;
  let xAxis = uniq(data.map((x) => x.name));
  let series = stacked.map((s) => {
    const temp = data.map((d) => {
      const val = d.stack.find((c) => c.name === s);
      return val?.value || 0;
    });
    return {
      name: s,
      type: "bar",
      stack: "count",
      label: { show: true },
      emphasis: {
        focus: "series",
      },
      data: temp,
    };
  });
  let option = {
    ...Color,
    legend: {
      data: legends,
      icon: "circle",
      top: "top",
      left: "left",
      align: "left",
      orient: "horizontal",
      itemGap: 10,
      textStyle: {
        fontWeight: "normal",
        fontSize: 12,
        marginLeft: 20,
      },
    },
    grid: {
      top: "15%",
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
    toolbox: {
      show: true,
      orient: "horizontal",
      left: "right",
      top: "top",
      feature: {
        saveAsImage: {
          type: "jpg",
          title: "save image",
          icon: Icons.saveAsImage,
        },
        dataView: {
          show: true,
          title: "table view",
          icon: Icons.dataView,
        },
      },
    },
    yAxis: {
      type: "value",
    },
    xAxis: {
      data: xAxis,
      type: "category",
      axisLabel: {
        color: "#222",
        ...TextStyle,
        ...AxisLabelFormatter,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    series: series,
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default BarStack;
