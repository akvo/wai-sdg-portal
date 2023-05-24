import React, { useState, useEffect } from 'react';
import { Col, Spin } from 'antd';

import '../main.scss';
import { UIState } from '../../../state/ui';
import { generateAdvanceFilterURL } from '../../../util/utils';
import Chart from '../../../chart';
import api from '../../../util/api';
import takeRight from 'lodash/takeRight';

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

  const handleOnDataset = (dataset) => {
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
        score: findData?.score,
        stack: stack,
      };
    });
    return {
      data,
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
      Promise.all(apiCall)
        .then((res) => {
          const allData = res?.map(({ data: apiData }) => {
            const { data: dataset } = apiData;
            return handleOnDataset(dataset);
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
