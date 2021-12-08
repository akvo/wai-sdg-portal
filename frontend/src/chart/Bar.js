import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  AxisLabelFormatter,
  DataView,
  Title,
  axisTitle,
  NoData,
} from "./chart-style.js";
import sortBy from "lodash/sortBy";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";
import uiText from "../util/i18n.js";

const Bar = (data, chartTitle, extra) => {
  const { chartText } = uiText;
  if (isEmpty(data) || !data) {
    return NoData;
  }

  // Custom Axis Title
  const { xAxisTitle, yAxisTitle } = axisTitle(extra);

  data = sortBy(data, "order");
  let labels = data.map((x) => x.name);
  let option = {
    ...Color,
    title: {
      ...Title,
      show: !isEmpty(chartTitle),
      text: chartTitle?.title,
      subtext: chartTitle?.subTitle,
    },
    grid: {
      top: "25%",
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
          title: chartText?.btnSaveImage,
          icon: Icons.saveAsImage,
          backgroundColor: "#EAF5FB",
        },
        dataView: {
          ...DataView,
          optionToContent: function (opt) {
            var series = opt.series[0].data;
            var table =
              '<table border="1" style="width:90%;text-align:center">';
            table += "<thead><tr>";
            table += "<th>" + chartText?.tbColCategory + "</th>";
            table += "<th>" + chartText?.tbColCount + "</th>";
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
    yAxis: {
      type: "value",
      name: yAxisTitle || "",
      nameTextStyle: { ...TextStyle },
      nameLocation: "middle",
      nameGap: 50,
    },
    xAxis: {
      type: "category",
      data: labels,
      name: xAxisTitle || "",
      nameTextStyle: { ...TextStyle },
      nameLocation: "middle",
      nameGap: 50,
      axisLabel: {
        color: "#222",
        ...TextStyle,
        ...AxisLabelFormatter,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    series: [
      {
        data: data.map((v, vi) => ({
          name: v.name,
          value: v.value,
          itemStyle: { color: v.color || Color.color[vi] },
        })),
        type: "bar",
        barMaxWidth: 50,
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
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default Bar;
