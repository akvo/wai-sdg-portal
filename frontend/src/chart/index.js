import React from "react";
import { Col, Card } from "antd";
import ReactECharts from "echarts-for-react";
import Bar from "./Bar";
import Line from "./Line";

export const generateOptions = ({ type, data }, extra, axis) => {
  switch (type) {
    case "LINE":
      return Line(data, extra);
    default:
      return Bar(data, extra);
  }
};

const Chart = ({
  type,
  title = "",
  height = 450,
  span = 12,
  data,
  extra = {},
  wrapper = true,
  axis = null,
  styles = {},
}) => {
  data = data.map((x) => ({
    ...x,
    name: x.name,
    var: x.name,
  }));
  const option = generateOptions({ type: type, data: data }, extra, axis);
  if (wrapper) {
    return (
      <Col
        sm={24}
        md={span * 2}
        lg={span}
        style={{ height: height, ...styles }}
      >
        <Card title={title}>
          <ReactECharts
            option={option}
            style={{ height: height - 50, width: "100%" }}
          />
        </Card>
      </Col>
    );
  }
  return (
    <ReactECharts
      option={option}
      style={{ height: height - 50, width: "100%" }}
    />
  );
};

export default Chart;
