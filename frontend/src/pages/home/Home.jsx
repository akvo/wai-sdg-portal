import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Space, Carousel, Image, Spin } from "antd";
import { RightOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import api from "../../util/api";

import "./home.scss";
import Map from "../../components/Map";
import Chart from "../../chart";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

const level2 = window.levels[0];
const { datasetsInPortal, overviews } = window.landing_config;
const {
  exploreText,
  exploreDataText,
  readMoreText,
  overviewSectionTitle,
  datasetSectionTitle,
  jumbotronText,
} = window?.i18n?.home;

const OverviewInfo = ({ item, order }) => {
  const { type, category, data } = item;
  const { above_text, number_text, explore, value, total } = data;
  let text = number_text;
  if (text?.includes("##total##")) {
    text = text.replace("##total##", total || "");
  }
  return (
    <Col
      key={`${type}-${category}`}
      span={12}
      className="overview-item-col"
      order={order}
    >
      <Card className={`overview-item-card ${category}`}>
        <Row
          className="overview-item"
          gutter={[24, 24]}
          align="middle"
          justify="center"
        >
          <Col span={8} align="center">
            <Image
              className="overview-icon"
              width="100%"
              src={`/icons/landing-${category}-icon.png`}
              alt={category}
              preview={false}
            />
          </Col>
          <Col span={16}>
            <div className="area">{above_text}</div>
            <div className="count">
              <CountUp decimals={1} end={value || 0} />%
            </div>
            <div className="text">{text}</div>
            <div className="explore">
              <Link to={explore}>
                <Space align="center" size="small">
                  {exploreText} <ArrowRightOutlined />
                </Space>
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

const OverviewChart = ({ item, order }) => {
  const { type, name, category, data, qname } = item;
  return (
    <Col
      key={`${type}-${category}`}
      span={12}
      className="overview-item-col"
      order={order}
    >
      <Card className={`overview-item-card ${category}`}>
        <Row align="middle" justify="center" className="overview-item">
          <Col span={24} align="center">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div className="chart-title">
                {qname ? upperFirst(qname) : upperFirst(name)}
              </div>
              <Chart type="PIE" data={data} wrapper={false} height={250} />
            </Space>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

const OverviewColumn = ({ items, index }) => {
  return items.map((item, idx) => {
    if (item?.type === "info") {
      return (
        <OverviewInfo
          key={`${item?.type}-${idx}`}
          item={item}
          order={index % 2 === 0 ? 2 : 1}
        />
      );
    }
    return (
      <OverviewChart
        key={`${item?.type}-${idx}`}
        item={item}
        order={index % 2 === 0 ? 1 : 2}
      />
    );
  });
};

const Home = () => {
  const [overviewData, setOverviewData] = useState([]);

  useEffect(() => {
    if (!isEmpty(overviews) && isEmpty(overviewData)) {
      const apiCall = overviews?.map(({ form_id, question, option }) => {
        let url = `chart/overviews/${form_id}/${question}/${option}`;
        return api.get(url);
      });
      Promise.all(apiCall)
        .then((res) => {
          const allData = res?.map((r) => {
            const { form, question, question_name, data } = r?.data;
            // find overview config
            const overview = overviews?.find(
              (x) => x.form_id === form && x.question === question
            );
            // map res data to add more overview config
            const dataTmp = data.map((d) => {
              const { above_text, number_text, explore, name } = overview;
              const category = name
                ? name.toLowerCase().split(" ").join("-")
                : "";
              if (d?.type === "info") {
                return {
                  ...d,
                  category: category,
                  name: name,
                  data: {
                    ...d?.data,
                    above_text,
                    number_text,
                    explore,
                  },
                };
              }
              return {
                ...d,
                category: category,
                qname: question_name,
                name: name,
              };
            });
            return dataTmp;
          });
          return allData;
        })
        .then((res) => {
          setOverviewData(res);
        });
    }
  }, [overviewData]);

  return (
    <Row className="home-container">
      {/* Jumbotron */}
      <Col span={24}>
        <Row
          className="container jumbotron-wrapper"
          align="top"
          justify="space-between"
          wrap={true}
        >
          <Col lg={9}>
            <h1 className="jumbotron-text">
              {jumbotronText?.includes("##administration##")
                ? jumbotronText.replace("##administration##", level2)
                : jumbotronText}
            </h1>
          </Col>
          <Col lg={14}>
            <Card className="map-wrapper">
              <Map mapHeight={550} />
            </Card>
          </Col>
        </Row>
      </Col>
      {/* Dataset Card */}
      <Col span={24}>
        <Row className="dataset-container" align="middle">
          <Col className="container dataset-col" span={24}>
            <h1>{datasetSectionTitle}</h1>
            <Row align="middle" justify="space-around" wrap={true}>
              {datasetsInPortal.map(
                ({ title, description, readmore, explore }) => (
                  <Col key={title} sm={24} md={18} lg={7}>
                    <Card className="dataset-item">
                      <h2>{title}</h2>
                      <p>{description}</p>
                      {/* Hide hyperlink for now */}
                      {/* <div className="button-wrapper">
                        <div className="read-more">
                          <Link to={readmore}>
                            <Space align="center" size="small">
                              {readMoreText} <ArrowRightOutlined />
                            </Space>
                          </Link>
                        </div>
                        <div className="explore">
                          <Link to={explore}>
                            <Space align="center" size="small">
                              {exploreDataText} <RightOutlined />
                            </Space>
                          </Link>
                        </div>
                      </div> */}
                    </Card>
                  </Col>
                )
              )}
            </Row>
          </Col>
        </Row>
      </Col>
      {/* Overview Caraousel */}
      <Col span={24}>
        <Row className="overview-container">
          <Col span={24} className="container">
            <h1>{overviewSectionTitle}</h1>
          </Col>
          <Col span={24} className="overview-content-wrapper">
            <Carousel autoplay effect="fade">
              {isEmpty(overviewData) && (
                <div className="chart-loading">
                  <Spin />
                </div>
              )}
              {!isEmpty(overviewData) &&
                overviewData?.map((items, i) => (
                  <div key={`overview-${i}`}>
                    <Row
                      align="middle"
                      justify="space-between"
                      wrap={true}
                      gutter={[24, 24]}
                      className="overview-item-row"
                    >
                      <OverviewColumn
                        key={`overview-column-${i}`}
                        items={items}
                        index={i}
                      />
                    </Row>
                  </div>
                ))}
            </Carousel>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Home;
