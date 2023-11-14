import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Card, Space, Tabs, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { chain, groupBy, sumBy } from 'lodash';
import api from '../../util/api';

import './home.scss';
import Map from '../../components/Map';
import Chart from '../../chart';
// import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';

const level2 = window.levels[0];
const { jumbotron, datasetsInPortal, overviews } = window.landing_config;
const { overviewSectionTitle, datasetSectionTitle } = window.i18n.home;

const { TabPane } = Tabs;

const OverviewChart = ({ item, formID }) => {
  const { path: category, title, order, question } = item;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    totalPage: null,
  });

  const getJMPChartApi = useCallback(async () => {
    if (formID && category) {
      try {
        if (
          (pagination.totalPage && pagination.current < pagination.totalPage) ||
          (!pagination.totalPage && loading)
        ) {
          const currentPage = pagination.totalPage
            ? pagination.current + 1
            : pagination.current;

          const { data: apiData } = await api.get(
            `/chart/jmp-data/${formID}/${category}?page=${currentPage}`
          );
          const { total_page: totalPage, data: chartData } = apiData || {};

          const allData = chartData?.flatMap((cd) => cd?.child);
          const allValues = chain(groupBy(allData, 'option'))
            .map((v, k) => {
              const { color } = v?.[0] || {};
              const sumCategory = sumBy(v, 'count');
              return {
                name: k,
                count: sumCategory,
                itemStyle: {
                  color,
                },
              };
            })
            .value();
          const totalValues = sumBy(allValues, 'count');
          const _data = allValues.map((a) => {
            const percentage = Math.round((a.count / totalValues) * 100);
            return {
              ...a,
              total: totalValues,
              value: percentage,
            };
          });
          setData(_data);
          setPagination({
            current: currentPage,
            totalPage,
          });
        }
      } catch (error) {
        console.error('error:', error);
        setLoading(false);
      }
    }

    if (loading && pagination.current === pagination.totalPage) {
      setLoading(false);
    }
  }, [formID, category, loading, pagination]);

  const getChartApi = useCallback(async () => {
    setLoading(true);
    try {
      if (formID && question) {
        const { data: apiData } = await api.get(
          `/chart/pie-data/${formID}/${question}`
        );
        const { data: chartData } = apiData || {};
        setData(chartData);
        setLoading(false);
      }
    } catch (error) {
      console.error('error:', error);
      setLoading(false);
    }
  }, [formID, question]);

  useEffect(() => {
    getJMPChartApi();
  }, [getJMPChartApi]);

  useEffect(() => {
    getChartApi();
  }, [getChartApi]);

  return (
    <Col
      key={`${order}-${category}`}
      span={8}
      className="overview-item-col"
      order={order}
    >
      <Card
        title={upperFirst(title || '')}
        className="overview-item-card"
      >
        <Row
          align="middle"
          justify="center"
          className="overview-item"
        >
          <Col
            span={24}
            align="center"
          >
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Spin
                spinning={loading}
                indicator={<LoadingOutlined />}
              >
                <Chart
                  type="PIE"
                  data={data}
                  wrapper={false}
                  height={250}
                />
              </Spin>
            </Space>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

const OverviewColumn = ({ items, formID }) => {
  return items.map((item, idx) => {
    return (
      <OverviewChart
        key={idx}
        item={item}
        formID={formID}
      />
    );
  });
};

const JumbotronInfo = ({ jumbotron }) => {
  const ListComponent = ({ listType, className, children }) => {
    if (listType === 'number') {
      return <ol className={className}>{children}</ol>;
    }
    return <ul className={className}>{children}</ul>;
  };
  const { title, list_type, list } = jumbotron;
  let titleText = title;
  if (titleText?.includes('##administration##')) {
    titleText = titleText.replace('##administration##', level2);
  }
  if (list.length && list_type) {
    return (
      <>
        <h4 className="title">{titleText}</h4>
        <ListComponent
          listType={list_type}
          className="list"
        >
          {list.map((l, il) => (
            <li key={il}>{l}</li>
          ))}
        </ListComponent>
      </>
    );
  }
  return <h4 className="jumbotron-text">{titleText}</h4>;
};

const Home = () => {
  return (
    <Row className="home-container">
      {/* Jumbotron */}
      <Col span={24}>
        <Row
          className="jumbotron-wrapper"
          align="top"
          justify="space-between"
          wrap={true}
        >
          <div className="jumbotron-overlay-container">
            <JumbotronInfo jumbotron={jumbotron} />
          </div>
          <Col lg={24}>
            <Card className="map-wrapper">
              <Map />
            </Card>
          </Col>
        </Row>
      </Col>
      {/* Dataset Card */}
      <Col span={24}>
        <Row
          className="dataset-container"
          align="middle"
        >
          <Col
            className="container dataset-col"
            span={24}
          >
            <h1>{datasetSectionTitle}</h1>
            <Row
              align="middle"
              justify="space-around"
              wrap={true}
            >
              {datasetsInPortal.map(({ title, description }) => (
                <Col
                  key={title}
                  sm={24}
                  md={18}
                  lg={7}
                >
                  <Card className="dataset-item">
                    <h2>{title}</h2>
                    <p>{description}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Col>
      {/* Overview Caraousel */}
      <Col span={24}>
        <Row className="overview-container">
          <Col
            span={24}
            className="container"
          >
            <h1>{overviewSectionTitle}</h1>
          </Col>
          <Col
            span={24}
            className="overview-content-wrapper"
          >
            <Card>
              <Tabs
                defaultActiveKey={overviews?.[0]?.name}
                centered
              >
                {overviews?.map((overview) => {
                  const items = overview?.chartList || [];
                  return (
                    <TabPane
                      tab={overview.name}
                      key={overview.key}
                    >
                      <Row
                        gutter={16}
                        type="flex"
                        justify="center"
                      >
                        <OverviewColumn
                          items={items}
                          formID={overview?.form_id}
                        />
                      </Row>
                    </TabPane>
                  );
                })}
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Home;
