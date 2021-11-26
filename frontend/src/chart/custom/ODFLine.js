import {
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
      trigger: "item",
    },
    grid: {
      top: "20px",
      left: "20px",
      bottom: "0px",
      containLabel: true,
      label: {
        color: "#000",
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
      axisLine: {
        show: false,
      },
      axisLabel: {
        ...AxisLabelFormatter,
        color: "rgba(0, 0, 0, 0.85)",
        fontWeight: "normal",
        fontSize: "12px",
      },
      axisTick: {
        show: false,
      },
    },
    series: data.series.map((x, xi) => {
      return {
        type: "line",
        data: x.data,
        itemStyle: {
          color: "#ddd",
        },
        lineStyle: {
          width: 15,
        },
      };
    }),
    animation: false,
    ...Color,
    ...backgroundColor,
    ...extra,
  };
  return option;
};

export default ODFLine;
