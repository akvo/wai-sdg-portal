import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  Legend,
  AxisLabelFormatter,
  DataView,
} from "./chart-style.js";
import sortBy from "lodash/sortBy";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

const Bar = (data, extra) => {
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
  data = sortBy(data, "order");
  let labels = data.map((x) => x.name);
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
            var series = opt.series[0].data;
            var table =
              '<table border="1" style="width:90%;text-align:center">';
            table += "<thead><tr>";
            table += "<th>Category</th>";
            table += "<th>Count</th>";
            table += "</tr></thead><tbody>";
            for (var i = 0, l = series.length; i < l; i++) {
              table += "<tr>";
              table += "<td>" + upperFirst(series[i].name) + "</td>";
              table += "<td>" + series[i].value + "</td>";
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
        data: data.map((v, vi) => ({
          name: v.name,
          value: v.value,
          itemStyle: { color: v.color || Color.color[vi] },
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
