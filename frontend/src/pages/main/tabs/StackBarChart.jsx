import React, { useMemo, useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import uniq from 'lodash/uniq';
import sum from 'lodash/sum';
import Chart from '../../../chart';
import PaginationApi from '../../../components/PaginationApi';

const PER_PAGE = 250;

const getAdmScores = (chartScores, data) => {
  // Initial value of each option within each administration
  const statusValues = {};
  const statusPercentages = {};
  const scoreValues = {};
  uniq(data.map((d) => d?.administration))?.forEach((d) => {
    const dataItems = data?.[0]?.child?.map((c) => ({
      [c?.option]: 0,
    }));
    const initialValues = Object.assign({}, ...dataItems);
    statusValues[d] = initialValues;
    statusPercentages[d] = initialValues;
    scoreValues[d] = [];
  });
  for (let i = 0; i < data.length; i++) {
    const { administration, child } = data[i];
    for (let j = 0; j < child.length; j++) {
      const { option, percent } = child[j];
      statusValues[administration][option] += percent;
    }
  }
  // Calculate the percentage of each option within each administration
  for (const administration in statusValues) {
    const totalPercent = Object.values(statusValues[administration]).reduce(
      (total, percent) => total + percent,
      0
    );
    for (const option in statusValues[administration]) {
      const percent =
        (statusValues[administration][option] / totalPercent) * 100;
      const score = chartScores[option] || 0;
      scoreValues[administration].push((score * percent) / 100);
      statusPercentages[administration][option] = percent;
    }
  }
  return {
    statusPercentages,
    scoreValues,
  };
};

const StackBarChart = ({
  apiUrl,
  height,
  chartScores,
  totalPages,
  data,
  selectedAdministration,
}) => {
  const initLoading = totalPages > 1 ? true : false;
  const [chartValues, setChartValues] = useState(data);
  const [loading, setLoading] = useState(initLoading);

  const paginationCallback = (allData) => {
    const { statusPercentages, scoreValues } = getAdmScores(
      chartScores,
      allData
    );
    const _chartValues = data.map((d) => ({
      ...d,
      score: sum(scoreValues?.[d.id]),
      stack: d?.stack?.map((st) => ({
        ...st,
        value: statusPercentages?.[d.id]?.[st?.name],
      })),
    }));
    setChartValues(_chartValues);
    setLoading(false);
  };

  const chartShorted = useMemo(() => {
    return chartValues.map((c) => {
      const _stack = c?.stack
        ?.sort((a, b) => b.value - a.value)
        ?.map((s, sx) => {
          return {
            ...s,
            id: s.order,
            order: sx + 1,
          };
        });
      return {
        ...c,
        stack: _stack,
      };
    });
  }, [chartValues]);

  return (
    <div className="jmp-chart-container">
      <PaginationApi
        apiUrl={apiUrl}
        totalPages={totalPages}
        perPage={PER_PAGE}
        callback={paginationCallback}
      />
      <div className="jmp-chart">
        {loading ? (
          <div className="chart-loading">
            <Spin indicator={<LoadingOutlined />} />
          </div>
        ) : (
          <Chart
            title=""
            subTitle=""
            type={'JMP-BARSTACK'}
            data={chartShorted}
            wrapper={false}
            height={height < 320 ? 320 : height}
            extra={{
              selectedAdministration,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StackBarChart;
