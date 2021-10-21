import React, { useState, useEffect } from "react";
import { Row, Col, Space, Input, Collapse } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";
import api from "../../util/api";

import "./main.scss";
import config from "./config";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import { SelectLevel } from "../../components/common";
import ErrorPage from "../../components/ErrorPage";
import { UIState } from "../../state/ui";
import takeRight from "lodash/takeRight";
import MainTable from "./MainTable";
import MainMaps from "./MainMaps";

const { Search } = Input;
const { Panel } = Collapse;

const Main = ({ match }) => {
  const { user, selectedAdministration } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [questionGroup, setQuestionGroup] = useState([]);
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
        setQuestionGroup(d.data.question_group);
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
              <MainMaps
                geoUrl={ethGeoUrl}
                mapHeight={525}
                question={questionGroup
                  .map((q) => q.question)
                  .flatMap((x) => x)}
                current={current}
              />
            </div>
          </Col>
          <MainTable
            current={current}
            loading={loading}
            data={data}
            questionGroup={questionGroup}
            dataSource={data}
            total={total}
            changePage={changePage}
            lastSubmitted={lastSubmitted}
          />
        </Row>
      </Col>
      {/* Collapsable Charts*/}
      <Col span={24}>
        <Row align="middle" className="collapse-wrapper">
          <Col span={24} className="container">
            {current?.charts.map((c, ci) => (
              <Collapse
                key={`collapse-${ci}`}
                expandIcon={() => (
                  <PlusSquareOutlined style={{ fontSize: 18 }} />
                )}
                expandIconPosition="right"
                bordered={false}
              >
                <Panel header={c.title} key={ci}>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    ac consectetur diam. Pellentesque lacinia, erat ac efficitur
                    molestie, sapien odio efficitur purus, non ornare sem massa
                    euismod metus. Maecenas at dolor tortor. Praesent sit amet
                    mauris augue. Curabitur rutrum ipsum eget augue accumsan, in
                    porta velit dignissim. Integer mattis vulputate arcu, in
                    aliquet tellus lobortis auctor. Phasellus lacus augue,
                    ultrices mattis ultrices et, euismod quis erat.
                  </p>
                </Panel>
              </Collapse>
            ))}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Main;
