import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Space } from "antd";
import { RightOutlined, ArrowRightOutlined } from "@ant-design/icons";

import "./home.scss";

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

const Home = () => {
  return (
    <Row className="home-container">
      <Col span={24}>
        <Row className="container jumbotron-wrapper" gutter={[24, 24]}>
          <Col lg={10}>
            <h1 className="jumbotron-text">
              This portal is used by Woredas to see the relative WASH
              vulnerability of communities and institutions, and track the
              status of water and sanitation infrastructure
            </h1>
          </Col>
          <Col lg={14}>
            <Card className="map-wrapper">
              <p>Map here...</p>
            </Card>
          </Col>
        </Row>
      </Col>
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
      <Col span={24}>
        <Row className="overview-container">
          <Col span={24} className="container">
            <h1>Overview of Wordedas</h1>
          </Col>
          <Col span={24} className="overview-content-wrapper">
            <p>Carousel here...</p>
            <p>Carousel here...</p>
            <p>Carousel here...</p>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Home;
