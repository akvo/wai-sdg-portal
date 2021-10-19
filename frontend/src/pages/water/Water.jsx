import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Select,
  Button,
  Space,
  Divider,
  Form,
  Input,
  InputNumber,
  Carousel,
  Card,
  Table,
  Pagination,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../../util/api";

import "./water.scss";
import Map from "../../components/Map";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import { SelectFilter } from "../../components/common";
import { UIState } from "../../state/ui";

const { Search } = Input;
const { Option } = Select;

const columns = [
  { title: "Water Points", dataIndex: "name", key: "name" },
  { title: "Number of Users", dataIndex: 82, key: 82 },
  { title: "Water Source Type", dataIndex: 79, key: 79 },
  { title: "Energy Source", dataIndex: 81, key: 81 },
];

const childcolumns = [
  { dataIndex: "name", key: "name" },
  { dataIndex: "value", key: "value" },
  { dataIndex: "action", key: "action" },
];

const EditColumn = ({ value, question, edited, setEdited }) => {
  const [fieldActive, setFieldActive] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const onSave = () => {
    setFieldActive(false);
    setEdited({ ...edited, [question.id]: newValue });
  };
  if (fieldActive) {
    return (
      <Row>
        <Col>
          {question.type === "option" ? (
            <Select
              defaultValue={newValue || value}
              style={{ width: "100%" }}
              onChange={setNewValue}
            >
              {question.option.map((o, oi) => (
                <Option key={oi} value={o.name}>
                  {o.name}
                </Option>
              ))}
            </Select>
          ) : question.type === "number" ? (
            <InputNumber value={newValue || value} onChange={setNewValue} />
          ) : (
            <Input value={newValue || value} onChange={setNewValue} />
          )}
        </Col>
        <Col>
          <Button type="link" onClick={onSave}>
            Save
          </Button>
        </Col>
      </Row>
    );
  }
  return (
    <div onClick={() => setFieldActive(true)}>{newValue || value || " - "}</div>
  );
};

const ChildTable = ({ question, data }) => {
  const [edited, setEdited] = useState({});
  return question.map((g, gi) => {
    const source = g.question.map((q, qi) => ({
      name: q.name,
      value: (
        <EditColumn
          value={data.detail.find((d) => d.question === q.id)?.value || null}
          question={q}
          edited={edited}
          setEdited={setEdited}
        />
      ),
      action: (
        <div>
          {edited?.[q.id] && <Button type={"link"}>Reset</Button>}
          <Button type={"link"}>History</Button>
        </div>
      ),
      key: qi,
    }));
    return (
      <Table
        key={gi}
        showHeader={false}
        columns={childcolumns}
        dataSource={source}
        pagination={false}
        bordered={false}
      />
    );
  });
};

const Water = () => {
  const { user } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [question, setQuestion] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = (p) => {
    setLoading(true);
    api
      .get(`data/form/5?page=${p}`)
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
        setTotal(d.data.total_page);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!question.length) {
      api.get(`form/5`).then((d) => {
        setQuestion(d.data.question_group);
      });
    }
  }, []);

  useEffect(() => {
    if (loading && user) {
      fetch(page);
    }
  }, [user, page]);

  const changePage = (p) => {
    setPage(p);
    setLoading(true);
  };

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
          <Col span={12} className="map-wrapper">
            <div className="container">
              <Search
                className="map-search"
                placeholder="Search Water point"
                onSearch={() => console.log("search")}
              />
              <Map geoUrl={ethGeoUrl} mapHeight={525} />
            </div>
          </Col>
          <Col span={12} className="table-wrapper">
            <div className="container">
              <Row align="middle" justify="space-between" wrap={true}>
                <Col span={8}>
                  <span className="title">
                    Water Points: {"("}
                    {total}
                    {")"}
                  </span>
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
                    loading={loading}
                    columns={columns}
                    scroll={{ y: 320 }}
                    pagination={false}
                    expandable={{
                      expandedRowRender: (record) => (
                        <ChildTable question={question} data={record} />
                      ),
                    }}
                    dataSource={data}
                  />
                </Col>
              </Row>
              <Divider />
              <Row align="middle" justify="space-between" wrap={true}>
                <Col span={20}>
                  <Pagination
                    defaultCurrent={1}
                    total={total}
                    onChange={changePage}
                  />
                </Col>
                <Col span={4}>
                  <Link to="/form/water-point-data-upload/5">
                    <Button>Add New</Button>
                  </Link>
                </Col>
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
