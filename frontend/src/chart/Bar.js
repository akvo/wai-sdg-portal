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
import isEmpty from "lodash/isEmpty";

const Bar = (data, extra) => {
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
        },
        dataView: {
          show: true,
          title: "table view",
          icon: Icons.dataView,
          optionToContent: function (opt) {
            var axisData = opt.xAxis[0].data;
            var series = opt.series[0].data;
            var table =
              '<table style="width:100%;text-align:center"><tbody><tr>' +
              "<td>Option</td>" +
              "<td>Value</td>" +
              "</tr>";
            for (var i = 0, l = series.length; i < l; i++) {
              table +=
                "<tr>" +
                "<td>" +
                series[i].name +
                "</td>" +
                "<td>" +
                series[i].value +
                "</td>" +
                "</tr>";
            }
            table += "</tbody></table>";
            return table;
          },
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
