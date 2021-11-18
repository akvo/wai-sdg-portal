import React, { useState, useEffect } from "react";
import { Row, Col, Card, Select, Spin, Space } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";

import "./main.scss";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import Chart from "../../chart";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

const MainHistoryChart = ({ current, data, question }) => {
  const { historyChart } = UIState.useState((s) => s);
  const [historyChartData, setHistoryChartData] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [loadingChartData, setLoadingChartData] = useState(false);

  // Filter question option & number
  question = question.filter((q) => q.type === "option" || q.type === "number");

  useEffect(() => {
    if (!isEmpty(historyChart) && !isEmpty(data)) {
      setLoadingChartData(true);
      const { dataPointId, question } = historyChart;
      const temp = data.find((d) => d.key === dataPointId);
      const url = `history/${dataPointId}/${question?.id}`;
      api
        .get(url)
        .then((res) => {
          setSelectedData(temp?.name?.props?.record || {});
          setHistoryChartData(
            res.data.map((x, i) => ({
              ...x,
              key: `history-${i}`,
              question: question,
            }))
          );
        })
        .catch((err) => {
          setHistoryChartData([]);
        })
        .finally(() => {
          setLoadingChartData(false);
        });
    } else {
      setHistoryChartData([]);
    }
  }, [historyChart, data]);

  const handleOnChangeChartQuestion = (val) => {
    const selectedQuestion = question?.find((q) => q.id === val);
    UIState.update((s) => {
      s.historyChart = {
        ...historyChart,
        question: selectedQuestion,
      };
    });
  };

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
          <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Select
              allowClear
              showSearch
              placeholder="Select Question"
              style={{ width: "100%" }}
              options={question.map((q) => ({
                label: upperFirst(q.name),
                value: q.id,
              }))}
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handleOnChangeChartQuestion}
              value={isEmpty(historyChart) ? [] : [historyChart.question.id]}
            />
            <div className="chart-container">
              {!isEmpty(historyChartData) && !loadingChartData ? (
                <Chart
                  title={`${selectedData?.name} Datapoint`}
                  subTitle={upperFirst(historyChart?.question?.name)}
                  type="LINE"
                  data={historyChartData}
                  wrapper={false}
                />
              ) : loadingChartData ? (
                <Spin />
              ) : (
                "No Data"
              )}
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default MainHistoryChart;
