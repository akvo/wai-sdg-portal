import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Space, Card, Select, Spin } from 'antd';

import './main.scss';
import { UIState } from '../../state/ui';
import { generateAdvanceFilterURL } from '../../util/utils';
import Chart from '../../chart';
import api from '../../util/api';
import upperFirst from 'lodash/upperFirst';
import isEmpty from 'lodash/isEmpty';
import takeRight from 'lodash/takeRight';
import reverse from 'lodash/reverse';
import sumBy from 'lodash/sumBy';

const levels = window.map_config?.shapeLevels?.length;
const { mainText, chartText } = window.i18n;

const findLatestChildIds = (data, parentToFind) => {
  const latestChildren = [];
  data.forEach((item) => {
    if (item.parent === parentToFind) {
      const children = findLatestChildIds(data, item.id);
      if (children.length > 0) {
        latestChildren.push(...children);
      } else {
        latestChildren.push(item.id);
      }
    }
  });
  return latestChildren;
};

const MainChart = ({ current, question }) => {
  const { user, selectedAdministration, advanceSearchValue, administration } =
    UIState.useState((s) => s);
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [chartData, setChartData] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const [selectedStack, setSelectedStack] = useState({});
  const [chartTitle, setChartTitle] = useState(null);

  // Get question option only to use on Main Chart
  const questionOption = question?.filter((q) => q.type === 'option');

  const chartQuestionOptions = useMemo(() => {
    return questionOption
      ?.filter((q) => q.id !== selectedStack?.id)
      ?.map((q) => ({
        label: upperFirst(q.name),
        value: q.id,
      }));
  }, [questionOption, selectedStack]);

  const chartStackQuestionOptions = useMemo(() => {
    // add administration question to stack option
    const questionAdministration = question?.filter(
      (q) => q.type === 'administration'
    );
    const optionTemp = questionOption?.filter(
      (q) => q.id !== selectedQuestion?.id
    );
    return [...questionAdministration, ...optionTemp]?.map((q) => ({
      label: upperFirst(q.name),
      value: q.id,
    }));
  }, [question, questionOption, selectedQuestion]);

  const revertChart = () => {
    setSelectedQuestion({});
    setSelectedStack({});
    setChartData({});
  };

  useEffect(() => {
    if (isEmpty(selectedQuestion)) {
      const defQuestion = questionOption?.find(
        (q) => q.id === current?.default?.visualization
      );
      setSelectedQuestion(defQuestion);
    }
  }, [questionOption, selectedQuestion, current]);

  useEffect(() => {
    if (user && current?.formId) {
      revertChart();
    }
  }, [user, current]);

  useEffect(() => {
    if (!isEmpty(selectedQuestion) || !isEmpty(selectedStack)) {
      setLoadingChartData(true);
      let url = `chart/data/${selectedQuestion.form}?question=${selectedQuestion?.id}`;
      let chartTitleTemp = `This chart shows the distribution of {question|${selectedQuestion?.name}}`;
      // this if we have selected stack
      if (!isEmpty(selectedStack)) {
        url += `&stack=${selectedStack?.id}`;
        chartTitleTemp = `${chartTitleTemp} and {question|${selectedStack?.name}}`;
      }
      const adminId = takeRight(selectedAdministration)[0];
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      if (!isEmpty(advanceSearchValue)) {
        const filterByText = advanceSearchValue?.map((x) => {
          const { question, option } = x;
          let optText = '';
          // support multiple select on advanced filter option
          if (Array.isArray(option)) {
            optText = option.map((opt) => opt.split('|')[1]).join(', ');
          } else {
            optText = option.split('|')?.[1];
          }
          return `{question|${question}} is {option|${optText}}`;
        });
        chartTitleTemp = `${chartTitleTemp}, where ${filterByText?.join(
          ' and '
        )}${adminId ? ',' : ''}`;
      }
      // chart title text for administration
      if (adminId) {
        let adminText = administration?.find((x) => x.id === adminId)?.name;
        if (selectedAdministration?.length > levels) {
          adminText = selectedAdministration?.filter((x) => x);
          adminText = reverse(adminText)?.map(
            (x) => administration?.find((a) => a.id === x)?.name
          );
          adminText = adminText.join(', ');
        }
        chartTitleTemp = `${chartTitleTemp} for {question|${adminText}}`;
      }
      api
        .get(url)
        .then((res) => {
          let temp = [];
          if (res.data.type === 'BAR') {
            temp = selectedQuestion.option.map((opt) => {
              const val = res.data.data.find(
                (d) => d.name.toLowerCase() === opt.name.toLowerCase()
              );
              return {
                ...opt,
                value: val?.value || 0,
              };
            });
          }
          if (res.data.type === 'BARSTACK') {
            temp = selectedQuestion.option.map((opt) => {
              const group = res.data.data.find(
                (d) => d.group.toLowerCase() === opt.name.toLowerCase()
              );
              // handle if selected stack is administration question
              const isAdministrationQuestionSelected =
                selectedStack?.type === 'administration';
              let stack = group?.child || [];
              // map the stack with administration values
              if (isAdministrationQuestionSelected) {
                let admTmp = administration.filter((adm) =>
                  adminId ? adm.parent === adminId : !adm.parent
                );
                if (!admTmp.length && adminId) {
                  admTmp = administration.filter((adm) => adm.id === adminId);
                }
                admTmp = admTmp.map((adm) => ({
                  ...adm,
                  child_ids: findLatestChildIds(administration, adm.id),
                }));
                // agregate stack value by admin
                stack = admTmp.map((adm) => {
                  const val = group?.child?.filter((c) =>
                    adm.child_ids.length
                      ? adm.child_ids.includes(c.name)
                      : adm.id === c.name
                  );
                  return {
                    ...val,
                    name: adm.name,
                    value: sumBy(val, 'value'),
                  };
                });
              }
              if (!isAdministrationQuestionSelected) {
                stack = group?.child?.length
                  ? selectedStack.option.map((sopt) => {
                      const val = group.child.find(
                        (c) => c.name.toLowerCase() === sopt.name.toLowerCase()
                      );
                      return {
                        ...sopt,
                        value: val?.value || 0,
                      };
                    })
                  : selectedStack.option.map((sopt) => ({ ...sopt, value: 0 }));
              }
              return {
                ...opt,
                stack: stack,
              };
            });
          }
          setChartTitle(chartTitleTemp);
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
    <Row
      align="middle"
      className="collapse-wrapper"
    >
      <Col
        span={24}
        className="container"
      >
        <Card
          className="visual-card-wrapper"
          title={mainText?.mainChartCardTitle}
          key="main-chart-card"
        >
          <Space
            size="large"
            direction="vertical"
            style={{ width: '100%' }}
          >
            <Row
              align="middle"
              gutter={[24, 24]}
            >
              {/* Normal Selector */}
              <Col span={12}>
                <Select
                  allowClear
                  showSearch
                  placeholder={mainText?.mainChartSelectOptionPlaceholder}
                  style={{ width: '100%' }}
                  options={chartQuestionOptions}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={handleOnChangeChartQuestion}
                  value={isEmpty(selectedQuestion) ? [] : [selectedQuestion.id]}
                />
              </Col>
              {/* Stack Selector */}
              <Col span={12}>
                <Select
                  allowClear
                  showSearch
                  placeholder={mainText?.mainChartStackSelectOptionPlaceholder}
                  style={{ width: '100%' }}
                  options={chartStackQuestionOptions}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={handleOnChangeChartStack}
                  value={isEmpty(selectedStack) ? [] : [selectedStack.id]}
                  disabled={isEmpty(selectedQuestion)}
                />
              </Col>
            </Row>
            <div className="chart-container">
              {!isEmpty(chartData) && !loadingChartData ? (
                <Chart
                  title={chartTitle || ''}
                  type={chartData.type}
                  data={chartData.data}
                  height={750}
                  wrapper={false}
                  extra={{
                    axisTitle: {
                      y: [
                        selectedQuestion?.name || null,
                        selectedStack?.name || null,
                      ],
                      x: chartText?.percentageText,
                    },
                  }}
                />
              ) : loadingChartData ? (
                <Spin />
              ) : (
                ''
              )}
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default MainChart;
