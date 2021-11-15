import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  Legend,
  AxisLabelFormatter,
} from "./chart-style.js";
import sortBy from "lodash/sortBy";
import upperFirst from "lodash/upperFirst";

const Bar = (data, extra) => {
  let values = [];
  let labels = [];
  data = !data ? [] : data.map((x) => ({ ...x, name: upperFirst(x.name) }));
  if (data.length > 0) {
    data = sortBy(data, "order");
    values = data.map((x) => x.value);
    labels = data.map((x) => x.name);
  }
  let option = {
    ...Color,
    grid: {
      top: "15%",
      show: true,
      label: {
        color: "#222",
        ...TextStyle,
      },
    },
    tooltip: {
      show: true,
      trigger: "item",
      formatter: "{b}",
      padding: 5,
      backgroundColor: "#f2f2f2",
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
          backgroundColor: "#ffffff",
        },
      },
      backgroundColor: "#ffffff",
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        color: "#222",
        ...TextStyle,
        ...AxisLabelFormatter,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: data.map((v) => ({
          ...v,
          itemStyle: { color: v.color || "#36aa40" },
        })),
        type: "bar",
        label: {
          colorBy: "data",
          position: "insideBottom",
          show: true,
          padding: 5,
          backgroundColor: "rgba(0,0,0,.3)",
          ...TextStyle,
          color: "#fff",
        },
      },
    ],
    legend: {
      data: labels,
      ...Legend,
    },
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default Bar;
