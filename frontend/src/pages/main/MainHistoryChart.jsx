import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "antd";

import "./main.scss";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import Chart from "../../chart";
import isEmpty from "lodash/isEmpty";

const MainHistoryChart = ({ current, data }) => {
  const { historyChart } = UIState.useState((s) => s);
  const [historyChartData, setHistoryChartData] = useState([]);
  const [selectedData, setSelectedData] = useState({});

  console.log(data);

  useEffect(() => {
    if (!isEmpty(historyChart)) {
      const { dataPointId, question } = historyChart;
      const url = `history/${dataPointId}/${question?.id}`;
      api
        .get(url)
        .then((res) => {
          const temp = data.find((d) => d.key === historyChart.dataPointId);
          setSelectedData(temp || {});
          setHistoryChartData(
            res.data.map((x, i) => ({
              ...x,
              key: `history-${i}`,
              question: question,
            }))
          );
        })
        .catch((err) => {
          UIState.update((s) => {
            s.historyChart = {};
          });
        });
    } else {
      setHistoryChartData([]);
    }
  }, [historyChart]);

  return (
    <Row align="middle" className="collapse-wrapper">
      <Col span={24} className="container">
        <Card
          className="visual-card-wrapper"
          title="History Chart"
          key="history-chart-card"
        >
          <Chart type="LINE" data={historyChartData} wrapper={false} />
        </Card>
      </Col>
    </Row>
  );
};

export default MainHistoryChart;
