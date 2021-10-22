import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Space, Carousel, Image } from "antd";
import { RightOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CountUp from "react-countup";

import "./home.scss";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import Map from "../../components/Map";

import waterPointIcon from "../../sources/icons/landing-water-points-icon.png";
import odfIcon from "../../sources/icons/landing-odf-icon.png";
import healthFacilityIcon from "../../sources/icons/landing-health-facilities-icon.png";
import schoolIcon from "../../sources/icons/landing-schools-icon.png";

const datasetsInPortal = [
  {
    title: "JMP/SDG Status",
    description:
      "The JMP/SDG indicators describe the WASH service levels of communities, schools and health facilities, offering an approach to rank the vulnerability of these entities. This section helps WASH authorities to prioritize funding and resources to the most vulnerable.",
    readmore: "#",
    explore: "#",
  },
  {
    title: "CLTS + Progress",
    description:
      "Community Led Total Sanitation Plus is a methodology for achieving open defecation free and adequate coverage of sanitation facilities. This section tracks the progress of CLTS implementors.",
    readmore: "#",
    explore: "#",
  },
  {
    title: "Water Infrastructure",
    description:
      "This section contains technical and management data, and tracks the functionality of community water points. This is useful for month to month planning of maintenance and rehabilitation activities.",
    readmore: "#",
    explore: "#",
  },
];

const overviews = [
  [
    {
      type: "chart",
      category: "water-point",
    },
    {
      type: "info",
      category: "water-point",
      icon: waterPointIcon,
      woreda: 2,
      percent: 78,
      count: 282,
      text: "OF ##count## WATER POINTS ARE FUNCTIONAL",
      explore: "#",
    },
  ],
  [
    {
      type: "info",
      category: "odf",
      icon: odfIcon,
      woreda: 1,
      percent: 81,
      count: null,
      text: "OF ODF VILLAGES PER WOREDA",
      explore: "#",
    },
    {
      type: "chart",
      category: "odf",
    },
  ],
  [
    {
      type: "chart",
      category: "health-facilities",
    },
    {
      type: "info",
      category: "health-facilities",
      icon: healthFacilityIcon,
      woreda: 1,
      percent: 4.5,
      count: null,
      text: "OF HEALTH FACILITIES HAVE BASIC WATER ACCESS",
      explore: "#",
    },
  ],
  [
    {
      type: "info",
      category: "schools",
      icon: schoolIcon,
      woreda: 1,
      percent: 3.5,
      count: null,
      text: "OF SCHOOLS HAVE BASIC WATER ACCESS",
      explore: "#",
    },
    {
      type: "chart",
      category: "schools",
    },
  ],
];

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
              This portal is used by Woredas to see the relative WASH
              vulnerability of communities and institutions, and track the
              status of water and sanitation infrastructure
            </h1>
          </Col>
          <Col lg={14}>
            <Card className="map-wrapper">
              <Map geoUrl={ethGeoUrl} mapHeight={550} />
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
            <h1>Overview of Woredas</h1>
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
                        icon,
                        woreda,
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
                                    src={icon}
                                    alt={category}
                                    preview={false}
                                  />
                                </Col>
                                <Col span={16}>
                                  <div className="area">
                                    Across{" "}
                                    {woreda > 1
                                      ? `${woreda} Woredas`
                                      : "the country"}
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
