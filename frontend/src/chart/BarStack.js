import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  AxisLabelFormatter,
  Legend,
} from "./chart-style.js";
import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";

const BarStack = (data, extra) => {
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
  let stacked = data[0].stack.map((x) => ({ name: x.name, color: x.color }));
  let legends = stacked.map((s, si) => ({
    name: s.name,
    itemStyle: { color: s.color || Color.color[si] },
  }));
  let xAxis = uniq(data.map((x) => x.name));
  let series = stacked.map((s) => {
    const temp = data.map((d, di) => {
      const val = d.stack.find((c) => c.name === s.name);
      return {
        name: val?.name || null,
        value: val?.value || 0,
        itemStyle: { color: val?.color || s.color },
      };
    });
    return {
      name: s.name,
      type: "bar",
      stack: "count",
      label: {
        colorBy: "data",
        position: "insideBottom",
        show: true,
        padding: 5,
        backgroundColor: "rgba(0,0,0,.3)",
        ...TextStyle,
        color: "#fff",
      },
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
      ...Legend,
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
      orient: "vertical",
      right: 15,
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
          readOnly: true,
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
