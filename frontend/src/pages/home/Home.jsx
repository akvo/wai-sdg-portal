import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Space, Carousel, Image } from "antd";
import { RightOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CountUp from "react-countup";

import "./home.scss";
import Map from "../../components/Map";

const level1 = window.levels[0];
const level2 = window.levels[1];

const { datasetsInPortal, overviews } = window.landing_config;

const Home = () => {
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
              This portal is used by {level2} to see the relative WASH
              vulnerability of communities and institutions, and track the
              status of water and sanitation infrastructure
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
            <h1>Datasets in this Portal</h1>
            <Row align="middle" justify="space-around" wrap={true}>
              {datasetsInPortal.map(
                ({ title, description, readmore, explore }) => (
                  <Col key={title} sm={24} md={18} lg={7}>
                    <Card className="dataset-item">
                      <h2>{title}</h2>
                      <p>{description}</p>
                      <div className="button-wrapper">
                        <div className="read-more">
                          <Link to={readmore}>
                            <Space align="center" size="small">
                              Read more <ArrowRightOutlined />
                            </Space>
                          </Link>
                        </div>
                        <div className="explore">
                          <Link to={explore}>
                            <Space align="center" size="small">
                              EXPLORE THE DATA <RightOutlined />
                            </Space>
                          </Link>
                        </div>
                      </div>
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
            <h1>Overview of {level2}</h1>
          </Col>
          <Col span={24} className="overview-content-wrapper">
            <Carousel autoplay effect="fade">
              {overviews.map((items, i) => (
                <div key={`overview-${i}`}>
                  <Row
                    align="middle"
                    justify="space-between"
                    wrap={true}
                    gutter={[24, 24]}
                    className="overview-item-row"
                  >
                    {items.map(
                      ({
                        type,
                        category,
                        adm_level,
                        percent,
                        count,
                        text,
                        explore,
                      }) => {
                        return type === "chart" ? (
                          <Col
                            key={`${type}-${category}`}
                            span={12}
                            className="overview-item-col"
                          >
                            <Card className={`overview-item-card ${category}`}>
                              <Row className="overview-item">
                                <Col span={24}>Chart here</Col>
                              </Row>
                            </Card>
                          </Col>
                        ) : (
                          <Col
                            key={`${type}-${category}`}
                            span={12}
                            className="overview-item-col"
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
                                  <div className="area">
                                    Across{" "}
                                    {adm_level > 1
                                      ? `${adm_level} ${level2}`
                                      : "the " + level1}
                                  </div>
                                  <div className="count">
                                    <CountUp decimals={1} end={percent} />%
                                  </div>
                                  <div className="text">
                                    {!count
                                      ? text
                                      : text.replace("##count##", count)}
                                  </div>
                                  <div className="explore">
                                    <Link to={explore}>
                                      <Space align="center" size="small">
                                        Explore <ArrowRightOutlined />
                                      </Space>
                                    </Link>
                                  </div>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        );
                      }
                    )}
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
