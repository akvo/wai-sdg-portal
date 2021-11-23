import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "antd";

import "./main.scss";
import { UIState } from "../../state/ui";
import { generateAdvanceFilterURL } from "../../util/utils";
import Chart from "../../chart";
import api from "../../util/api";
import isEmpty from "lodash/isEmpty";
import takeRight from "lodash/takeRight";
import { titleCase } from "title-case";

const levels = window.map_config?.shapeLevels?.length;

const MainJmpChart = ({ current, question }) => {
  const {
    user,
    selectedAdministration,
    advanceSearchValue,
    administration,
  } = UIState.useState((s) => s);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAdministration.length <= levels && !isEmpty(chartData)) {
      setChartData([]);
    } else {
      const updateChartData = chartData?.map((c) => ({
        ...c,
        selectedAdministration: takeRight(selectedAdministration)[0],
      }));
      setChartData(updateChartData);
    }
  }, [selectedAdministration]);

  useEffect(() => {
    if (
      user &&
      current?.jmpCharts &&
      !isEmpty(administration) &&
      !isEmpty(question) &&
      !loading &&
      isEmpty(chartData) &&
      selectedAdministration.length <= levels
    ) {
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
                    value: findStack?.count || 0,
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
              selectedAdministration: null,
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

  return (
    <>
      {!loading &&
        chartData?.map((c, ci) => (
          <Row
            key={`jmp-chart-row-${ci}`}
            align="middle"
            className="collapse-wrapper"
          >
            <Col span={24} className="container">
              <Card className="visual-card-wrapper" title={c?.name}>
                <Chart
                  title=""
                  subTitle=""
                  type={c?.type}
                  data={c?.data}
                  wrapper={false}
                  height={600}
                  extra={{
                    selectedAdministration: c?.selectedAdministration,
                  }}
                />
              </Card>
            </Col>
          </Row>
        ))}
    </>
  );
};

export default MainJmpChart;
