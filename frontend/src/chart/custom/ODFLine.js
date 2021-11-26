import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Title,
  AxisLabelFormatter,
} from "../chart-style.js";

const ODFLine = (data, chartTitle, extra) => {
  let option = {
    title: {
      ...Title,
      show: chartTitle ? true : false,
      text: chartTitle?.title,
      subtext: chartTitle?.subTitle,
    },
    tooltip: {
      trigger: "axis",
    },
    grid: {
      top: "50px",
      containLabel: true,
      label: {
        color: "#222",
        ...TextStyle,
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.xAxis,
    },
    yAxis: {
      type: "category",
      data: data.yAxis,
      axisLabel: {
        ...AxisLabelFormatter,
      },
    },
    series: data.series.map((x, xi) => {
      return {
        data: x.data,
        type: "line",
      };
    }),
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  console.log(option);
  return option;
};

export default ODFLine;
