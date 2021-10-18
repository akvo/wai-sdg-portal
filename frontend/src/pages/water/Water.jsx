import React, { useState, useEffect } from "react";
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
  Table,
} from "antd";
import { Link } from "react-router-dom";
import api from "../../util/api";

import "./water.scss";
import Map from "../../components/Map";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import { SelectFilter } from "../../components/common";

const { Search } = Input;

const columns = [
  { title: "Water Points", dataIndex: "name", key: "name" },
  { title: "Number of Users", dataIndex: 82, key: 82 },
  { title: "Water Source Type", dataIndex: 79, key: 79 },
  { title: "Energy Source", dataIndex: 81, key: 81 },
];

const Water = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      api
        .get("/data/form/5", null, { param: { page: 1, perpage: 10 } })
        .then((d) => {
          const tableData = d.data.data.map((x) => {
            return {
              key: x.id,
              name: x.name,
              82: x.answer.find((a) => a.question === 82)?.value,
              79: x.answer.find((a) => a.question === 79)?.value,
              81: x.answer.find((a) => a.question === 81)?.value,
              detail: x.answer,
            };
          });
          setData(tableData);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return "";
  }

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
              <Row>
                <Col span={24}>
                  <Table
                    size="small"
                    columns={columns}
                    expandable={{
                      expandedRowRender: (record) => (
                        <p style={{ margin: 0 }}>{record.description}</p>
                      ),
                      rowExpandable: (record) =>
                        record.name !== "Not Expandable",
                    }}
                    dataSource={data}
                  />
                </Col>
              </Row>
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
