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
  const {
    user,
    selectedAdministration,
    advanceSearchValue,
    administration,
  } = UIState.useState((s) => s);
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [chartData, setChartData] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const [selectedStack, setSelectedStack] = useState({});
  const [chartSubTitle, setChartSubTitle] = useState([]);

  // Get question option only
  question = question?.filter((q) => q.type === "option");

  const revertChart = () => {
    setSelectedQuestion({});
    setSelectedStack({});
    setChartData({});
  };

  useEffect(() => {
    if (isEmpty(selectedQuestion)) {
      const defQuestion = question?.find(
        (q) => q.id === current?.default?.visualization
      );
      setSelectedQuestion(defQuestion);
    }
  }, [question]);

  useEffect(() => {
    if (user && current?.formId) {
      revertChart();
    }
  }, [user, current]);

  useEffect(() => {
    if (!isEmpty(selectedQuestion) || !isEmpty(selectedStack)) {
      setLoadingChartData(true);
      let url = `chart/data/${selectedQuestion.form}?question=${selectedQuestion?.id}`;
      let tempChartSubTitle = [];
      if (!isEmpty(selectedStack)) {
        url += `&stack=${selectedStack?.id}`;
        tempChartSubTitle = [
          ...tempChartSubTitle,
          upperFirst(selectedStack?.name),
        ];
      }
      const adminId = takeRight(selectedAdministration)[0];
      if (adminId) {
        url += `&administration=${adminId}`;
        tempChartSubTitle = [
          ...tempChartSubTitle,
          administration?.find((a) => a.id === adminId)?.name,
        ];
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      if (!isEmpty(advanceSearchValue)) {
        const tempAdvance = advanceSearchValue?.map((x) =>
          upperFirst(x.option.split("|")?.[1])
        );
        tempChartSubTitle = [...tempChartSubTitle, ...tempAdvance];
      }
      api
        .get(url)
        .then((res) => {
          setChartSubTitle(tempChartSubTitle);
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
    administration,
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
            <div className="chart-container">
              {!isEmpty(chartData) && !loadingChartData ? (
                <Chart
                  title={upperFirst(selectedQuestion?.name)}
                  subTitle={chartSubTitle.join(" - ")}
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
