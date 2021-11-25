import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Card } from "antd";

import "./main.scss";
import { UIState } from "../../state/ui";
import { generateAdvanceFilterURL } from "../../util/utils";
import Chart from "../../chart";
import api from "../../util/api";
import takeRight from "lodash/takeRight";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

const MainPieChart = ({ current, question }) => {
  const { cltsCharts, formId } = current;
  const { user, selectedAdministration, advanceSearchValue } = UIState.useState(
    (s) => s
  );
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    if (user && cltsCharts) {
      const apiCall = cltsCharts?.map((chart) => {
        // !!## FIXME - need to change form id (4) to current form id,
        let url = `chart/clts-pie-data/4/${chart?.question}`;
        const adminId = takeRight(selectedAdministration)[0];
        if (adminId) {
          url += `?administration=${adminId}`;
        }
        // advance search
        url = generateAdvanceFilterURL(advanceSearchValue, url);
        return api.get(url);
      });
      Promise.all(apiCall)
        .then((res) => {
          const allData = res.map((r) => {
            const chartSetting = cltsCharts?.find(
              (c) => c.question === r?.data?.question
            );
            return { ...r?.data, ...chartSetting };
          });
          return allData;
        })
        .then((data) => {
          setPieChartData(data);
        });
    }
  }, [user, current, selectedAdministration, advanceSearchValue, cltsCharts]);

  if (!cltsCharts) {
    return null;
  }

  return (
    <Col span={24}>
      <Row
        align="middle"
        className="collapse-wrapper container row-gutter"
        gutter={[24, 24]}
      >
        {isEmpty(pieChartData) ? (
          <div className="chart-loading">
            <Spin />
          </div>
        ) : (
          pieChartData?.map((p, pi) => (
            <Col key={`pie-chart-col-${pi}`} span={12}>
              <Card
                key={`pie-chart-card-${pi}`}
                className="visual-card-wrapper"
                title={p?.name ? upperFirst(p?.name) : ""}
              >
                <Chart type={p.type} data={p.data} wrapper={false} />
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Col>
  );
};

export default MainPieChart;
