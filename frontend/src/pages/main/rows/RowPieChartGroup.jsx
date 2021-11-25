import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Card } from "antd";

import "../main.scss";
import { UIState } from "../../../state/ui";
import { generateAdvanceFilterURL } from "../../../util/utils";
import Chart from "../../../chart";
import api from "../../../util/api";
import takeRight from "lodash/takeRight";
import upperFirst from "lodash/upperFirst";

const RowPieChartGroup = ({ formId, configFormId, chartList }) => {
  const {
    user,
    selectedAdministration,
    advanceSearchValue,
    loadedFormId,
  } = UIState.useState((s) => s);
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    if (
      user &&
      chartList.length &&
      loadedFormId !== null &&
      loadedFormId === formId
    ) {
      const apiCall = chartList?.map((chart) => {
        const fid = configFormId || formId;
        let url = `chart/pie-data/${fid}/${chart?.question}`;
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
            const chartSetting = chartList.find(
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
  }, [
    user,
    formId,
    configFormId,
    loadedFormId,
    selectedAdministration,
    advanceSearchValue,
    chartList,
  ]);

  if (!chartList.length) {
    return null;
  }

  return (
    <Row align="middle" className="collapse-wrapper">
      <Col span={24} className="container">
        {!pieChartData.length ? (
          <div className="chart-loading">
            <Spin />
          </div>
        ) : (
          <Row>
            {pieChartData?.map((p, pi) => (
              <Col key={pi} span={24 / pieChartData.length}>
                <Card
                  className="visual-card-wrapper splited"
                  title={p?.name ? upperFirst(p?.name) : ""}
                >
                  <Chart
                    type={p.type}
                    data={p.data}
                    wrapper={false}
                    height={300}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Col>
    </Row>
  );
};

export default RowPieChartGroup;
