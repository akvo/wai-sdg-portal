import React, { useState, useEffect } from "react";
import moment from "moment";
import { Row, Col, Spin, Divider, Pagination } from "antd";
import Chart from "../../../chart";

const dateFormat = "MMM YYYY";

const getRange = (startDate, endDate) => {
  const type = "months";
  let fromDate = moment(startDate);
  let toDate = moment(endDate);
  let diff = toDate.diff(fromDate, type);
  let range = [];
  for (let i = 0; i < diff; i++) {
    range.push(moment(startDate).add(i, type));
  }
  return range.map((r) => r.format(dateFormat));
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

const TabODF = ({
  setting,
  data,
  show,
  loading,
  page,
  total,
  changePage,
  setPerPage,
}) => {
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
            name: `${name}, ${adm}`,
            startValue: startValue,
            startDate: startDate ? moment(startDate) : false,
            endValue: endValue,
            endDate: endDate ? moment(endDate) : moment(),
            data: [
              [
                startDate ? moment(startDate).format(dateFormat) : false,
                `${name}, ${adm}`,
              ],
              [
                endDate
                  ? moment(endDate).format(dateFormat)
                  : moment().format(dateFormat),
                `${name}, ${adm}`,
              ],
            ],
          };
        })
        .filter((v) => v.name && v.startDate);
      const minDate = moment.min(values.map((v) => v.startDate));
      const xAxis = getRange(minDate.add(-1, "M"), moment().add(1, "M"));
      const yAxis = values.map((v) => v.name);
      setChartData({ xAxis: xAxis, yAxis: yAxis, series: values });
    }
  }, [data, setting]);

  if (!setting) {
    return "";
  }

  if (!show) {
    return null;
  }

  return (
    <Row className="container">
      <Col span={24}>
        <div className="chart-container odf">
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
                  height={430}
                />
              </div>
            </Col>
          )}
        </div>
      </Col>
      <Col span={24}>
        <Divider />
        {total ? (
          <Pagination
            defaultCurrent={1}
            current={page}
            total={total}
            size="small"
            onShowSizeChange={(e, s) => {
              setPerPage(s);
            }}
            pageSizeOptions={[10, 20, 50]}
            onChange={changePage}
          />
        ) : (
          ""
        )}
      </Col>
    </Row>
  );
};

export default TabODF;
