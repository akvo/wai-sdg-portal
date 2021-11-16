import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  AxisLabelFormatter,
  Legend,
  DataView,
} from "./chart-style.js";
import uniq from "lodash/uniq";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

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
          ...DataView,
          optionToContent: function (opt) {
            var xAxis = opt.xAxis.map((x) => x.data)[0];
            var series = opt.series.map((x) => x.data);
            var table =
              '<table border="1" style="width:90%;text-align:center">';
            table += "<thead><tr><th></th>";
            for (var a = 0, b = xAxis.length; a < b; a++) {
              table += "<th>" + upperFirst(xAxis[a]) + "</th>";
            }
            table += "</tr></thead><tbody>";
            for (var i = 0, l = series.length; i < l; i++) {
              table += "<tr>";
              table += "<td><b>" + upperFirst(series[i][0].name) + "</b></td>";
              for (var x = 0, y = series[i].length; x < y; x++) {
                table += "<td>" + series[i][x].value + "</td>";
              }
              table += "</tr>";
            }
            table += "</tbody></table>";
            return (
              '<div style="display:flex;align-items:center;justify-content:center">' +
              table +
              "</div>"
            );
          },
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
