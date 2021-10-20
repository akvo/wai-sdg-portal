import React, { useState, useEffect } from "react";
import { Row, Col, Space, Input, Carousel, Card } from "antd";
import api from "../../util/api";

import "./main.scss";
import config from "./config";
import Map from "../../components/Map";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import { SelectLevel } from "../../components/common";
import ErrorPage from "../../components/ErrorPage";
import { UIState } from "../../state/ui";
import takeRight from "lodash/takeRight";
import MainTable from "./MainTable";

const { Search } = Input;

const Main = ({ match }) => {
  const { user, selectedAdministration } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [question, setQuestion] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lastSubmitted, setLastSubmitted] = useState({ by: "", at: "" });

  const current = config?.[match.params.page];
  const changePage = (p) => {
    setPage(p);
    setLoading(true);
  };

  useEffect(() => {
    if (user && current?.formId) {
      api.get(`form/${current.formId}`).then((d) => {
        setQuestion(d.data.question_group);
      });
    }
  }, [user, current]);

  useEffect(() => {
    if (user && current) {
      const adminId = takeRight(selectedAdministration)[0];
      setLoading(true);
      let url = `data/form/${current.formId}?page=${page}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      api
        .get(url)
        .then((d) => {
          const tableData = d.data.data.map((x) => {
            const values = current?.values?.reduce(
              (o, key) =>
                Object.assign(o, {
                  [key]: x.answer.find((a) => a.question === key)?.value,
                }),
              {}
            );
            return {
              key: x.id,
              name: x.name,
              detail: x.answer,
              ...values,
            };
          });
          setData(tableData);
          setTotal(d.data.total_page);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setTotal(0);
          setLoading(false);
        });
    }
  }, [page, user, current, selectedAdministration]);

  useEffect(() => {
    if (user && current) {
      const adminId = takeRight(selectedAdministration)[0];
      let url = `last-submitted?form_id=${current.formId}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      api
        .get(url)
        .then((res) => {
          setLastSubmitted(res.data);
        })
        .catch(() => {
          setLastSubmitted({ by: "", at: "" });
        });
    }
  }, [user, current, selectedAdministration]);

  if (!current) {
    return <ErrorPage status={404} />;
  }

  return (
    <Row className="main-container">
      {/* Filter */}
      <Col span={24}>
        <Row align="middle" className="filter-wrapper">
          <Col span={24} className="container">
            <Space size={20} align="center" wrap={true}>
              <SelectLevel />
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
                placeholder={`${current.title}`}
                onSearch={() => console.log("search")}
              />
              <Map geoUrl={ethGeoUrl} mapHeight={525} />
            </div>
          </Col>
          <MainTable
            current={current}
            loading={loading}
            data={data}
            question={question}
            dataSource={data}
            total={total}
            changePage={changePage}
            lastSubmitted={lastSubmitted}
          />
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

export default Main;
