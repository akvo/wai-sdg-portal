import React, { useState, useEffect } from "react";
import moment from "moment";
import { Col, Spin } from "antd";
import Chart from "../../../chart";

const getRange = (startDate, endDate) => {
  const type = "months";
  let fromDate = moment(startDate);
  let toDate = moment(endDate);
  let diff = toDate.diff(fromDate, type);
  let range = [];
  for (let i = 0; i < diff; i++) {
    range.push(moment(startDate).add(i, type));
  }
  return range.map((r) => r.format("YYYY-MM"));
};

const abrvAdministration = (str) => {
  if (!str) {
    return "";
  }
  return str
    .split(" ")
    .map((s) => s[0])
    .join("");
};

const TabODF = ({ setting, data, show, loading }) => {
  const [chartData, setChartData] = useState({
    xAxis: [],
    yAxis: [],
    series: [],
  });

  useEffect(() => {
    if (data.length) {
      const values = data
        .map((x) => {
          let name = x.detail.find((v) => v.question === setting.name)?.value;
          const adm = abrvAdministration(x?.name?.props?.record?.name);
          name = name ? `${name}, ${adm}` : false;

          let startDate = x.detail.find((v) => v.question === setting.startDate)
            ?.value;
          let endDate = x.detail.find((v) => v.question === setting.endDate)
            ?.value;

          const startValue = x.detail.find(
            (v) => v.question === setting.startValue
          )?.value;
          const endValue = x.detail.find((v) => v.question === setting.endValue)
            ?.value;

          return {
            name: name,
            startValue: startValue,
            startDate: startDate ? moment(startDate) : false,
            endValue: endValue,
            endDate: endDate ? moment(endDate) : moment(),
            data: [
              [startDate ? moment(startDate).format("YYYY-MM") : false, name],
              [
                endDate
                  ? moment(endDate).format("YYYY-MM")
                  : moment().format("YYYY-MM"),
                name,
              ],
            ],
          };
        })
        .filter((v) => v.name && v.startDate);
      const minDate = moment.min(values.map((v) => v.startDate));
      const xAxis = getRange(minDate, moment().add(1, "M"));
      const yAxis = values.map((v) => v.name);
      setChartData({ xAxis: xAxis, yAxis: yAxis, series: values });
    }
  }, [data]);

  if (!setting) {
    return "";
  }

  if (!show) {
    return null;
  }

  return (
    <div className="container chart-container">
      {loading ? (
        <div className="chart-loading">
          <Spin />
        </div>
      ) : (
        <Col span={24}>
          <div className="odf-chart">
            <Chart
              title=""
              subTitle=""
              type={"ODF-LINE"}
              data={chartData}
              transform={false}
              wrapper={false}
              height={580}
            />
          </div>
        </Col>
      )}
    </div>
  );
};

export default TabODF;
