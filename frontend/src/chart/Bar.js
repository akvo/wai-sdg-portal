import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  Legend,
  AxisLabelFormatter,
} from "./chart-style.js";
import { formatNumber } from "../util/utils.js";
import sortBy from "lodash/sortBy";
import reverse from "lodash/reverse";

const Bar = (data, extra) => {
  let values = [];
  let labels = [];
  data = !data ? [] : data;
  if (data.length > 0) {
    data = sortBy(data, "name");
    data = reverse(data);
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
        data: values,
        type: "bar",
        label: {
          formatter: function (params) {
            return formatNumber(params.data);
          },
          position: "insideBottom",
          show: true,
          color: "#222",
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
