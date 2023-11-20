import React, { useState, useEffect } from 'react';
import { Col, Spin } from 'antd';
import '../main.scss';
import { UIState } from '../../../state/ui';
import {
  generateAdvanceFilterURL,
  sequentialPromise,
} from '../../../util/utils';
import api from '../../../util/api';
import takeRight from 'lodash/takeRight';
import { titleCase } from 'title-case';
import StackBarChart from './StackBarChart';

const levels = window.map_config?.shapeLevels?.length;
const PER_PAGE = 250;

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
                <StackBarChart
                  {...{ ...c, chartScores }}
                  apiUrl={getApiUrl(c.question)}
                />
              </Col>,
            ];
          })}
        </Col>
      )}
    </div>
  );
};

export default TabJMP;
