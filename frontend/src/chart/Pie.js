import {
  Color,
  Easing,
  Legend,
  TextStyle,
  backgroundColor,
} from "./chart-style.js";
import sumBy from "lodash/sumBy";

const Pie = (data, extra, Doughnut = false) => {
  data = !data ? [] : data;
  let total = { name: "total", value: 0 };
  let labels = [];
  if (data.length > 0) {
    // filter value < 0
    data = data.filter((x) => x.value >= 0);
    labels = data.map((x) => x.name);
    total = {
      ...total,
      value: sumBy(data, "value"),
    };
  }
  let rose = {};
  const { textStyle } = TextStyle;
  let option = {
    tooltip: {
      show: true,
      trigger: "item",
      formatter: "{b}",
      padding: 5,
      backgroundColor: "#f2f2f2",
      textStyle: {
        ...textStyle,
        fontSize: 12,
      },
    },
    series: [
      {
        name: "main",
        type: "pie",
        right: "center",
        radius: Doughnut ? ["0%", "100%"] : ["50%", "100%"],
        top: "30px",
        label: {
          normal: {
            formatter: function (params) {
              if (params.value >= 0) {
                return Math.round(params.value) + "%";
              }
              return "";
            },
            show: true,
            position: Doughnut ? "inner" : "outside",
            padding: 5,
            borderRadius: 100,
            backgroundColor: Doughnut ? "rgba(0,0,0,.5)" : "rgba(0,0,0,.3)",
            textStyle: {
              ...textStyle,
              color: "#fff",
            },
          },
        },
        labelLine: {
          normal: {
            show: true,
          },
        },
        data: data,
        ...rose,
      },
      // {
      //   data: [total],
      //   type: "pie",
      //   right: "center",
      //   radius: Doughnut ? ["0%", "0%"] : ["0%", "40%"],
      //   color: ["#f1f1f5"],
      //   top: "30px",
      //   label: {
      //     normal: {
      //       formatter: function (params) {
      //         let values = params.data.value;
      //         return `Total\n${values}`;
      //       },
      //       show: !Doughnut,
      //       position: "center",
      //       textStyle: {
      //         ...textStyle,
      //         fontSize: 16,
      //         backgroundColor: "transparent",
      //         padding: 0,
      //         borderRadius: 0,
      //         fontWeight: "bold",
      //         color: "#333433",
      //       },
      //     },
      //   },
      // },
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

export default Pie;
