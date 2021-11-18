import React, { useState, useEffect } from "react";
import { Row, Col, Space, Card, Select, Spin } from "antd";

import "./main.scss";
import { UIState } from "../../state/ui";
import { generateAdvanceFilterURL } from "../../util/utils";
import Chart from "../../chart";
import api from "../../util/api";
import upperFirst from "lodash/upperFirst";
import isEmpty from "lodash/isEmpty";
import takeRight from "lodash/takeRight";

const { chartFeature } = window.features;

const MainChart = ({ current, question }) => {
  const { user, selectedAdministration, advanceSearchValue } = UIState.useState(
    (s) => s
  );
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [chartData, setChartData] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const [selectedStack, setSelectedStack] = useState({});

  // Get question option only
  question = question?.filter((q) => q.type === "option");

  const revertChart = () => {
    setSelectedQuestion({});
    setSelectedStack({});
    setChartData({});
  };

  useEffect(() => {
    if (user && current?.formId) {
      revertChart();
    }
  }, [user, current]);

  useEffect(() => {
    if (!isEmpty(selectedQuestion) || !isEmpty(selectedStack)) {
      setLoadingChartData(true);
      let url = `chart/data/${selectedQuestion.form}?question=${selectedQuestion?.id}`;
      if (!isEmpty(selectedStack)) {
        url += `&stack=${selectedStack?.id}`;
      }
      const adminId = takeRight(selectedAdministration)[0];
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      api
        .get(url)
        .then((res) => {
          let temp = [];
          if (res.data.type === "BAR") {
            temp = selectedQuestion.option.map((opt) => {
              const val = res.data.data.find((d) => d.name === opt.name);
              return {
                ...opt,
                value: val?.value || 0,
              };
            });
          }
          if (res.data.type === "BARSTACK") {
            temp = selectedQuestion.option.map((opt) => {
              const group = res.data.data.find((d) => d.group === opt.name);
              const child = group?.child.length
                ? selectedStack.option.map((sopt) => {
                    const val = group.child.find((c) => c.name === sopt.name);
                    return {
                      ...sopt,
                      value: val?.value || 0,
                    };
                  })
                : selectedStack.option.map((sopt) => ({ ...sopt, value: 0 }));
              return {
                ...opt,
                stack: child,
              };
            });
          }
          setChartData({ ...res.data, data: temp });
          setLoadingChartData(false);
        })
        .catch(() => {
          setChartData({});
          setLoadingChartData(false);
        });
    } else {
      setChartData({});
    }
  }, [
    selectedQuestion,
    selectedStack,
    selectedAdministration,
    advanceSearchValue,
  ]);

  const handleOnChangeChartQuestion = (val) => {
    if (val) {
      const selected = question.find((q) => q.id === val);
      setSelectedQuestion(selected);
    } else {
      setSelectedQuestion({});
      setSelectedStack({});
    }
  };

  const handleOnChangeChartStack = (val) => {
    setChartData({});
    const selected = question.find((q) => q.id === val);
    setSelectedStack(val ? selected : {});
  };

  return (
    <Row align="middle" className="collapse-wrapper">
      <Col span={24} className="container">
        <Card
          className="visual-card-wrapper"
          title="Visualisations"
          key="main-chart-card"
        >
          <Space size="large" direction="vertical" style={{ width: "100%" }}>
            <Row align="middle" gutter={[24, 24]}>
              <Col span={chartFeature?.stack ? 12 : 24}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Select Question"
                  style={{ width: "100%" }}
                  options={question
                    ?.filter((q) => q.id !== selectedStack?.id)
                    ?.map((q) => ({
                      label: upperFirst(q.name),
                      value: q.id,
                    }))}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={handleOnChangeChartQuestion}
                  value={isEmpty(selectedQuestion) ? [] : [selectedQuestion.id]}
                />
              </Col>
              {chartFeature?.stack && (
                <Col span={12}>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Select Second Question"
                    style={{ width: "100%" }}
                    options={question
                      ?.filter((q) => q.id !== selectedQuestion?.id)
                      ?.map((q) => ({
                        label: upperFirst(q.name),
                        value: q.id,
                      }))}
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    onChange={handleOnChangeChartStack}
                    value={isEmpty(selectedStack) ? [] : [selectedStack.id]}
                    disabled={isEmpty(selectedQuestion)}
                  />
                </Col>
              )}
            </Row>
            <div
              style={{
                minHeight: "450px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!isEmpty(chartData) && !loadingChartData ? (
                <Chart
                  type={chartData.type}
                  data={chartData.data}
                  wrapper={false}
                />
              ) : loadingChartData ? (
                <Spin />
              ) : (
                ""
              )}
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default MainChart;
