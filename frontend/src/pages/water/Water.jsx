import React from "react";
import {
  Row,
  Col,
  Select,
  Button,
  Space,
  Divider,
  Input,
  Carousel,
  Card,
} from "antd";
import { Link } from "react-router-dom";

import "./water.scss";
import Map from "../../components/Map";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import { SelectFilter } from "../../components/common";

const { Search } = Input;

const Water = () => {
  return (
    <Row className="water-container">
      {/* Filter */}
      <Col span={24}>
        <Row align="middle" className="filter-wrapper">
          <Col span={24} className="container">
            <Space size={20} align="center" wrap={true}>
              <SelectFilter placeholder="Select Dataset" />
              <SelectFilter placeholder="Select Woreda" />
              <SelectFilter placeholder="Select Kebele" />
              <Button className="remove-filter-button">Remove Filter</Button>
            </Space>
          </Col>
        </Row>
      </Col>
      {/* Data View */}
      <Col span={24}>
        <Row align="top" className="data-container" wrap={true}>
          <Col span={14} className="map-wrapper">
            <div className="container">
              <Search
                className="map-search"
                placeholder="Search Water point"
                onSearch={() => console.log("search")}
              />
              <Map geoUrl={ethGeoUrl} mapHeight={525} />
            </div>
          </Col>
          <Col span={10} className="table-wrapper">
            <div className="container">
              <Row align="middle" justify="space-between" wrap={true}>
                <Col span={8}>
                  <span className="title">Water Points</span>
                </Col>
                <Col span={12} align="end">
                  <span className="info">Last submitted 18.00 by User</span>
                </Col>
              </Row>
              <Divider />
              <Row align="middle" justify="space-between" wrap={true}>
                <Link to="/form/water-point-data-upload/5">
                  <Button>Add New</Button>
                </Link>
              </Row>
            </div>
          </Col>
        </Row>
      </Col>
      {/* Carousel */}
      <Col span={24}>
        <Row align="middle" className="carousel-wrapper">
          <Col span={24} className="container">
            <Carousel autoplay effect="fade">
              {["Facility 1", "Facility 2"].map((x) => (
                <div key={x} className="carousel-item-wrapper">
                  <h1>{x}</h1>
                  <Card className="carousel-item-card">Content {x}</Card>
                </div>
              ))}
            </Carousel>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Water;
