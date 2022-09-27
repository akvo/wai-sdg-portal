import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Row, Col, Spin, Divider, Space, Pagination } from 'antd';
import { UIState } from '../../../state/ui';
import Chart from '../../../chart';
import { getDateRange } from '../../../util/date.js';

const dateFormat = 'MMM YYYY';
const serverDateFormat = 'YYYY-MM-DD';

const abrvAdministration = (str) => {
  if (!str) {
    return '';
  }
  return str
    .split(' ')
    .map((s) => s[0])
    .join('');
};

const TabODF = ({
  setting,
  data,
  show,
  loading,
  page,
  total,
  formId,
  changePage,
  setPerPage,
}) => {
  const {
    user,
    selectedAdministration,
    advanceSearchValue,
    administration,
    loadedFormId,
  } = UIState.useState((s) => s);
  const [chartData, setChartData] = useState({
    xAxis: [],
    yAxis: [],
    series: [],
  });

  data = data.reverse();

  useEffect(() => {
    if (
      (user,
      administration.length,
      data.length,
      loadedFormId !== null && loadedFormId === formId)
    ) {
      const values = data
        .map((x) => {
          const name = x.detail.find((v) => v.question === setting.name)?.value;
          const adm = abrvAdministration(x?.name?.props?.record?.name);

          const startDate = x.detail.find(
            (v) => v.question === setting.startDate
          )?.value;
          const endDate = x.detail.find(
            (v) => v.question === setting.endDate
          )?.value;

          const startValue = x.detail.find(
            (v) => v.question === setting.startValue
          )?.value;
          const endValue = x.detail.find(
            (v) => v.question === setting.endValue
          )?.value;

          return {
            name: `${name}, ${adm}`,
            startValue: startValue,
            startDate: startDate ? moment(startDate, serverDateFormat) : false,
            endValue: endValue,
            endDate: endDate ? moment(endDate, serverDateFormat) : moment(),
            data: [
              [
                startDate
                  ? moment(startDate, serverDateFormat).format(dateFormat)
                  : false,
                `${name}, ${adm}`,
              ],
              [
                endDate
                  ? moment(endDate, serverDateFormat).format(dateFormat)
                  : moment().format(dateFormat),
                `${name}, ${adm}`,
              ],
            ],
          };
        })
        .filter((v) => v.name && v.startDate);
      const minDate = moment.min(values.map((v) => v.startDate));
      const xAxis = getDateRange({
        startDate: minDate.add(-2, 'months'),
        endDate: moment().add(2, 'months'),
        dateFormat: dateFormat,
      });
      const yAxis = values.map((v) => v.name);
      setChartData({ xAxis: xAxis, yAxis: yAxis, series: values });
    }
  }, [
    user,
    setting,
    data,
    formId,
    loadedFormId,
    administration,
    selectedAdministration,
    advanceSearchValue,
  ]);

  if (!setting) {
    return '';
  }

  if (!show) {
    return null;
  }

  return (
    <Row className="container">
      <Col span={24}>
        <div className="chart-container odf">
          {loading ? (
            <div className="chart-loading">
              <Spin />
            </div>
          ) : (
            <Col span={24}>
              <div className="odf-legend">
                <Space>
                  <span className="dot trigered" />
                  Date Triggered
                  <span className="dot verified" />
                  Date of Verification
                  <span className="dot on going" />
                  Today
                </Space>
              </div>
              <div className="odf-chart">
                <Chart
                  title=""
                  subTitle=""
                  type={'ODF-LINE'}
                  data={chartData}
                  transform={false}
                  wrapper={false}
                  height={390}
                />
              </div>
            </Col>
          )}
        </div>
      </Col>
      <Col span={24}>
        <Divider />
        {total ? (
          <Pagination
            defaultCurrent={1}
            current={page}
            total={total}
            size="small"
            onShowSizeChange={(e, s) => {
              setPerPage(s);
            }}
            pageSizeOptions={[10, 20, 50]}
            onChange={changePage}
          />
        ) : (
          ''
        )}
      </Col>
    </Row>
  );
};

export default TabODF;
