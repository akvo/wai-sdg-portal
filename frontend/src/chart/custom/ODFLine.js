import {
  Color,
  TextStyle,
  backgroundColor,
  Title,
  AxisLabelFormatter,
} from "../chart-style.js";
import moment from "moment";

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
      top: "20px",
      left: "20px",
      bottom: "20px",
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
      axisLabel: {
        ...AxisLabelFormatter,
        color: "rgba(0, 0, 0, 0.85)",
        fontWeight: "normal",
        fontSize: "12px",
        padding: [10, 0, 0, 0],
      },
      axisTick: {
        alignWithLabel: true,
      },
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
        data: x.data.map((g) => ({ value: g, data: x })),
        itemStyle: {
          color: (p) => {
            const start = p.dataIndex === 0;
            return start
              ? "#1890ff"
              : p.data.data.endValue
              ? "#00989f"
              : "#a4a4a4";
          },
        },
        lineStyle: {
          width: 7,
          color: "#a4a4a4",
        },
        label: {
          show: true,
          formatter: (p) => {
            const val = p.data.data;
            return p.dataIndex === 0 ? val.startValue : val.endValue;
          },
        },
        symbol: "circle",
        symbolSize: 7,
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
