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
    if (
      user &&
      current?.jmpCharts &&
      !isEmpty(administration) &&
      !isEmpty(question) &&
      !loading
    ) {
      setLoading(true);
      const administrationId =
        selectedAdministration.length <= 2
          ? takeRight(selectedAdministration)[0]
          : selectedAdministration[1];
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
      Promise.all(apiCall).then((res) => {
        const allData = res?.map((r) => {
          const selectedQuestion = question.find(
            (q) => q.id === r?.data?.question
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
          return { name: titleCase(selectedQuestion?.name), data: data };
        });
        setChartData(allData);
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
              <Card className="visual-card-wrapper" title={c.name}>
                <Chart
                  title=""
                  subTitle=""
                  type="JMP-BARSTACK"
                  data={c.data}
                  wrapper={false}
                  height={600}
                />
              </Card>
            </Col>
          </Row>
        ))}
    </>
  );
};

export default MainJmpChart;
