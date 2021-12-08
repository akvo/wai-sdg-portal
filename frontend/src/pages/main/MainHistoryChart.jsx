import React, { useState, useEffect } from "react";
import { Row, Col, Card, Select, Spin, Space } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";

import "./main.scss";
import { UIState } from "../../state/ui";
import api from "../../util/api";
import Chart from "../../chart";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";
import uiText from "../../util/i18n";

const MainHistoryChart = ({ current, data, question }) => {
  const { mainText } = uiText;
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
          let data = res?.data?.map((x, i) => ({
            ...x,
            key: `history-${i}`,
          }));
          if (question?.type === "option") {
            data = question?.option?.map((opt) => {
              const find = data?.find(
                (d) => d?.value?.toLowerCase() === opt?.name?.toLowerCase()
              );
              return {
                ...opt,
                ...find,
                type: question?.type,
              };
            });
          }
          if (question?.type === "number") {
            data = data?.map((d) => ({
              ...d,
              type: question?.type,
              rule: question?.rule,
            }));
          }
          setHistoryChartData(data);
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
                {mainText?.historyChartCardTitle}
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
              placeholder={mainText?.historyChartSelectOptionPlaceholder}
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
                mainText?.noDataText
              )}
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default MainHistoryChart;
