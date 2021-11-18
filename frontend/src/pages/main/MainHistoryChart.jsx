import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";

import "./main.scss";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import Chart from "../../chart";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

const MainHistoryChart = ({ current, data }) => {
  const { historyChart } = UIState.useState((s) => s);
  const [historyChartData, setHistoryChartData] = useState([]);
  const [selectedData, setSelectedData] = useState({});

  useEffect(() => {
    if (!isEmpty(historyChart) && !isEmpty(data)) {
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
  }, [historyChart, data]);

  return (
    <Row align="middle" className="collapse-wrapper">
      <Col span={24} className="container">
        <Card
          className="visual-card-wrapper"
          title={
            <Row align="middle">
              <Col align="start" span={12}>
                History Chart
              </Col>
              <Col align="end" span={12}>
                <CloseSquareOutlined
                  onClick={() => {
                    UIState.update((s) => {
                      s.historyChart = {};
                    });
                  }}
                />
              </Col>
            </Row>
          }
          key="history-chart-card"
        >
          <Chart
            title={`${selectedData?.name?.props?.name} Datapoint`}
            subTitle={upperFirst(historyChart?.question?.name)}
            type="LINE"
            data={historyChartData}
            wrapper={false}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default MainHistoryChart;
