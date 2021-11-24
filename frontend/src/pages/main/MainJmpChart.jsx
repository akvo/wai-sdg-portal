import React, { useState, useEffect } from "react";
import { Col, Spin } from "antd";

import "./main.scss";
import { UIState } from "../../state/ui";
import { generateAdvanceFilterURL } from "../../util/utils";
import Chart from "../../chart";
import api from "../../util/api";
import isEmpty from "lodash/isEmpty";
import takeRight from "lodash/takeRight";
import { titleCase } from "title-case";

const levels = window.map_config?.shapeLevels?.length;

const MainJmpChart = ({ current, question, show }) => {
  const {
    user,
    selectedAdministration,
    advanceSearchValue,
    administration,
  } = UIState.useState((s) => s);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      selectedAdministration.length < levels + 1 ||
      !isEmpty(advanceSearchValue)
    ) {
      setChartData([]);
    }
  }, [selectedAdministration, advanceSearchValue]);

  useEffect(() => {
    if (
      user &&
      current?.jmpCharts &&
      administration.length &&
      question.length &&
      !loading &&
      !chartData.length
    ) {
      console.log("reload");
      setLoading(true);
      const administrationId =
        selectedAdministration.length <= levels
          ? takeRight(selectedAdministration)[0]
          : selectedAdministration[levels - 1];
      const administrationList = administration.filter(
        (adm) => adm?.parent === administrationId
      );
      const apiCall = current?.jmpCharts?.map((chart) => {
        let url = `chart/jmp-data/${current?.formId}/${chart?.question}`;
        url += `?administration=${administrationId || 0}`;
        // advance search
        url = generateAdvanceFilterURL(advanceSearchValue, url);
        return api.get(url);
      });
      Promise.all(apiCall)
        .then((res) => {
          const allData = res?.map((r) => {
            const selectedQuestion = question.find(
              (q) => q.id === r?.data?.question
            );
            const chartSetting = current?.jmpCharts?.find(
              (c) => c.question === r?.data?.question
            );
            const data = administrationList.map((adm) => {
              const findData = r?.data?.data?.find(
                (d) => d.administration === adm.id
              );
              let stack = [];
              if (findData) {
                stack = selectedQuestion?.option?.map((opt) => {
                  const findStack = findData?.child?.find(
                    (c) => c?.option?.toLowerCase() === opt?.name?.toLowerCase()
                  );
                  return {
                    ...opt,
                    value: findStack?.percent || 0,
                  };
                });
              }
              return {
                ...adm,
                score: findData?.score || null,
                stack: stack,
              };
            });
            return {
              name: selectedQuestion?.name
                ? titleCase(selectedQuestion.name)
                : "",
              type: chartSetting?.type,
              selectedAdministration:
                selectedAdministration.length <= levels
                  ? null
                  : takeRight(selectedAdministration)[0],
              data: data,
            };
          });
          return allData;
        })
        .then((res) => {
          setChartData(res);
          setLoading(false);
        });
    }
  }, [
    user,
    current,
    administration,
    selectedAdministration,
    question,
    advanceSearchValue,
    loading,
    chartData,
  ]);

  if (!current?.jmpCharts || isEmpty(current?.jmpCharts)) {
    return "";
  }

  if (!show) {
    return null;
  }

  return (
    <div className="container chart-container">
      {loading ? (
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
              <Col key={`jmp-chart-row-${ci}`} span={24}>
                <div className="jmp-chart">
                  <Chart
                    title=""
                    subTitle=""
                    type={c?.type}
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

export default MainJmpChart;
