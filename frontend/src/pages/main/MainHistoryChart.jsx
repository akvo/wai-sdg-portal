import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Spin, Space } from 'antd';
import { CloseSquareOutlined } from '@ant-design/icons';

import './main.scss';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import Chart from '../../chart';
import isEmpty from 'lodash/isEmpty';

const { mainText } = window.i18n;
const { Option } = Select;

const MainHistoryChart = ({ data, question }) => {
  const { historyChart } = UIState.useState((s) => s);
  const { disabled } = historyChart;
  const [historyChartData, setHistoryChartData] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [loadingChartData, setLoadingChartData] = useState(false);

  // Filter question option & number
  question = question
    .filter((q) => ['option', 'number'].includes(q.type))
    .map((q) => ({
      ...q,
      disabled: disabled?.map((d) => d.question)?.includes(q.id),
    }));

  useEffect(() => {
    if (!isEmpty(historyChart) && !isEmpty(data)) {
      setLoadingChartData(true);
      const { dataPointId, selected } = historyChart;
      const temp = data.find((d) => d.key === dataPointId);
      const url = `history/${dataPointId}/${selected?.id}`;
      api
        .get(url)
        .then((res) => {
          setSelectedData(temp?.name?.props?.record || {});
          let data = res?.data?.map((x, i) => ({
            ...x,
            key: `history-${i}`,
          }));
          if (selected?.type === 'option') {
            data = selected?.option?.map((opt) => {
              const find = data?.find(
                (d) => d?.value?.toLowerCase() === opt?.name?.toLowerCase()
              );
              return {
                ...opt,
                ...find,
                type: selected?.type,
              };
            });
          }
          if (selected?.type === 'number') {
            data = data?.map((d) => ({
              ...d,
              type: selected?.type,
              rule: selected?.rule,
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
        selected: selectedQuestion,
      };
    });
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
          title={
            <Row align="middle">
              <Col
                align="start"
                span={12}
              >
                {mainText?.historyChartCardTitle}
              </Col>
              <Col
                align="end"
                span={12}
              >
                <CloseSquareOutlined
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
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
          <Space
            size="large"
            direction="vertical"
            style={{ width: '100%' }}
          >
            <Select
              allowClear
              showSearch
              placeholder={mainText?.historyChartSelectOptionPlaceholder}
              style={{ width: '100%' }}
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handleOnChangeChartQuestion}
              value={isEmpty(historyChart) ? [] : [historyChart.selected.id]}
            >
              {question.map((q, qi) => (
                <Option
                  key={qi}
                  value={q.id}
                  disabled={q.disabled}
                >
                  {q.name}
                </Option>
              ))}
            </Select>
            <div className="chart-container">
              {!isEmpty(historyChartData) && !loadingChartData ? (
                <Chart
                  title={`${selectedData?.name} Datapoint`}
                  subTitle={historyChart?.selected?.name}
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
