import React, { useState, useEffect } from 'react';
import { Col, Spin } from 'antd';

import '../main.scss';
import { UIState } from '../../../state/ui';
import {
  generateAdvanceFilterURL,
  sequentialPromise,
} from '../../../util/utils';
import Chart from '../../../chart';
import PaginationApi from '../../../components/PaginationApi';
import api from '../../../util/api';
import takeRight from 'lodash/takeRight';
import { titleCase } from 'title-case';

const levels = window.map_config?.shapeLevels?.length;

const TabJMP = ({ formId, chartList, show }) => {
  const {
    user,
    selectedAdministration,
    advanceSearchValue,
    administration,
    loadedFormId,
  } = UIState.useState((s) => s);
  const [chartData, setChartData] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [chartScores, setChartScores] = useState([]);

  const administrationId =
    selectedAdministration.length <= levels
      ? takeRight(selectedAdministration)[0]
      : selectedAdministration[levels - 1];
  const administrationList = administration.filter(
    (adm) => adm?.parent === (administrationId || null)
  );
  const PER_PAGE = 250;

  useEffect(() => {
    if (loadedFormId !== formId) {
      setChartData([]);
    }
  }, [formId, loadedFormId]);

  const getApiUrl = (q) => {
    let url = `chart/jmp-data/${formId}/${q}?administration=${
      administrationId || 0
    }`;
    url = generateAdvanceFilterURL(advanceSearchValue, url); // advance search
    return url;
  };

  const handleOnDataset = (dataset, question, totalPages = 1) => {
    const data = administrationList.map((adm) => {
      const findData = dataset?.find((d) => d.administration === adm.id);
      const stack = findData?.child?.map((c, cx) => {
        return {
          id: cx,
          name: c.option,
          color: c.color,
          order: cx + 1,
          value: c.percent,
        };
      });
      return {
        ...adm,
        score: null,
        stack: stack,
      };
    });
    return {
      data,
      question,
      totalPages,
      name: titleCase(question),
      selectedAdministration:
        selectedAdministration.length <= levels
          ? null
          : takeRight(selectedAdministration)[0],
    };
  };

  const handleOnSumScores = (data) => {
    const sumScores = {};
    for (let i = 0; i < data.length; i++) {
      const { administration, child } = data[i];
      if (!sumScores.hasOwnProperty.call(administration)) {
        sumScores[administration] = {
          percentSum: {},
          percentByStatus: {},
          score: 0,
        };
      }
      for (let j = 0; j < child.length; j++) {
        const { option, percent } = child[j];
        if (!sumScores[administration].percentSum.hasOwnProperty.call(option)) {
          sumScores[administration].percentSum[option] = 0;
        }
        sumScores[administration].percentSum[option] += percent;
      }
    }
    // Calculate the percentage of each option within each administration
    for (const administration in sumScores) {
      const totalPercent = Object.values(
        sumScores[administration].percentSum
      ).reduce((total, percent) => total + percent, 0);

      for (const option in sumScores[administration].percentSum) {
        const percent =
          (sumScores[administration].percentSum[option] / totalPercent) * 100;
        sumScores[administration].percentByStatus[option] = percent;
      }
    }
    // Calculate the scores of each option within each administration
    const sc = {};
    for (const administration in sumScores) {
      sc[administration] = 0;
      for (const option in sumScores[administration].percentByStatus) {
        const scValue = chartScores[option] || 0;
        const prValue = parseFloat(
          sumScores[administration].percentByStatus[option],
          10
        );
        sc[administration] += (scValue * prValue) / 100;
      }
      sumScores[administration].score = sc[administration];
    }
    return sumScores;
  };

  const getAllPaginatedData = (question, allData) => {
    const sumScores = handleOnSumScores(allData);
    const _chartData = chartData?.map((c) =>
      c.question === question
        ? {
            ...c,
            data: c.data.map((d) => ({
              ...d,
              score: sumScores[d.id]?.score || d?.score,
              stack: d?.stack?.map((st) => ({
                ...st,
                value: sumScores[d.id]?.percentByStatus[st?.name] || st?.value,
              })),
            })),
          }
        : c
    );
    setChartData(_chartData);
  };

  useEffect(() => {
    if (
      user &&
      chartList?.length &&
      administration.length &&
      loadedFormId !== null &&
      loadedFormId === formId
    ) {
      setPageLoading(true);

      const apiCall = chartList?.map((chart) => {
        const url = getApiUrl(chart?.question);
        return api.get(`${url}&page=1&perpage=${PER_PAGE}`);
      });
      sequentialPromise(apiCall)
        .then((res) => {
          const allData = res?.map(({ data: apiData }, rx) => {
            const { data: dataset, question, total_page, scores } = apiData;
            if (rx === 0) {
              const _scores = scores
                .map((s) => {
                  const [key, value] = s;
                  return { [key]: value };
                })
                .reduce((acc, item) => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  acc[key] = value;
                  return acc;
                }, {});
              setChartScores(_scores);
            }
            return handleOnDataset(dataset, question, total_page);
          });
          setChartData(allData);
          setPageLoading(false);
        })
        .catch(() => {
          setChartData([]);
          setPageLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    chartList,
    formId,
    loadedFormId,
    administration,
    selectedAdministration,
    advanceSearchValue,
  ]);

  if (!chartList.length) {
    return '';
  }

  if (!show) {
    return null;
  }

  return (
    <div className="container chart-container">
      {pageLoading ? (
        <div className="chart-loading">
          <Spin />
        </div>
      ) : (
        <Col span={24}>
          {chartData?.map((c, ci) => {
            const height =
              (c?.data?.filter((x) => x?.stack?.length)?.length || 0) * 50;
            return [
              <Col
                key={`jmp-chart-title-${ci}`}
                span={24}
                className="data-info"
              >
                <span className="info title">{c?.name}</span>
              </Col>,
              <Col
                key={`jmp-chart-row-${ci}`}
                span={24}
              >
                <PaginationApi
                  apiUrl={getApiUrl(c.question)}
                  totalPages={c.totalPages}
                  perPage={PER_PAGE}
                  callback={(res) => getAllPaginatedData(c.question, res)}
                />
                <div className="jmp-chart">
                  <Chart
                    title=""
                    subTitle=""
                    type={'JMP-BARSTACK'}
                    data={c?.data}
                    wrapper={false}
                    height={height < 320 ? 320 : height}
                    extra={{
                      selectedAdministration: c?.selectedAdministration,
                    }}
                  />
                </div>
              </Col>,
            ];
          })}
        </Col>
      )}
    </div>
  );
};

export default TabJMP;
