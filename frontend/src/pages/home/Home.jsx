import React from 'react';
import { Row, Col, Card, Space, Tabs } from 'antd';
// import api from '../../util/api';

import './home.scss';
import Map from '../../components/Map';
import Chart from '../../chart';
// import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';

const level2 = window.levels[0];
const { jumbotron, datasetsInPortal, overviews } = window.landing_config;
const { overviewSectionTitle, datasetSectionTitle } = window.i18n.home;

const { TabPane } = Tabs;

const OverviewChart = ({ item }) => {
  const { path: category, title, order } = item;
  // TODO
  const data = [
    {
      name: 'decommissioned',
      count: 29,
      total: 100,
      value: 29,
    },
    {
      name: 'functional and not in use',
      count: 22,
      total: 100,
      value: 22,
    },
    {
      name: 'functional in use',
      count: 25,
      total: 100,
      value: 25,
    },
    {
      name: 'non-functional',
      count: 24,
      total: 100,
      value: 24,
    },
  ];
  return (
    <Col
      key={`${order}-${category}`}
      span={8}
      className="overview-item-col"
      order={order}
    >
      <Card
        title={title}
        className={`overview-item-card ${category}`}
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
              <div className="chart-title">{upperFirst(title)}</div>
              <Chart
                type="PIE"
                data={data}
                wrapper={false}
                height={250}
              />
            </Space>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

const OverviewColumn = ({ items }) => {
  return items.map((item, idx) => {
    return (
      <OverviewChart
        key={idx}
        item={item}
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
  // const [overviewData, setOverviewData] = useState([]);

  // useEffect(() => {
  //   if (!isEmpty(overviews) && isEmpty(overviewData)) {
  //     const apiCall = overviews?.map(({ form_id, question, option }) => {
  //       const url = `chart/overviews/${form_id}/${question}/${option}`;
  //       return api.get(url);
  //     });
  //     Promise.all(apiCall)
  //       .then((res) => {
  //         const allData = res?.map((r) => {
  //           const { form, question, question_name, data } = r.data;
  //           // find overview config
  //           const overview = overviews?.find(
  //             (x) => x.form_id === form && x.question === question
  //           );
  //           // map res data to add more overview config
  //           const dataTmp = data.map((d) => {
  //             const { above_text, number_text, explore, name } = overview;
  //             const category = name
  //               ? name.toLowerCase().split(' ').join('-')
  //               : '';
  //             if (d?.type === 'info') {
  //               return {
  //                 ...d,
  //                 category: category,
  //                 name: name,
  //                 data: {
  //                   ...d?.data,
  //                   above_text,
  //                   number_text,
  //                   explore,
  //                 },
  //               };
  //             }
  //             return {
  //               ...d,
  //               category: category,
  //               qname: question_name,
  //               name: name,
  //             };
  //           });
  //           return dataTmp;
  //         });
  //         return allData;
  //       })
  //       .then((res) => {
  //         setOverviewData(res);
  //       });
  //   }
  // }, [overviewData]);

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
                      <Row gutter={16}>
                        <OverviewColumn items={items} />
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
