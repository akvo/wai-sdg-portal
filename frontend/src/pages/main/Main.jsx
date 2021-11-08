import React, { useState, useEffect } from "react";
import { Row, Col, Space, Popover, Collapse, List } from "antd";
import { PlusSquareOutlined, InfoCircleOutlined } from "@ant-design/icons";
import api from "../../util/api";
import { useHistory } from "react-router-dom";

import "./main.scss";
import config from "./config";
import ethGeoUrl from "../../sources/eth-filtered.topo.json";
import { SelectLevel, DropdownNavigation } from "../../components/common";
import ErrorPage from "../../components/ErrorPage";
import { UIState } from "../../state/ui";
import takeRight from "lodash/takeRight";
import MainTable from "./MainTable";
import MainMaps from "./MainMaps";
import AdvanceSearch from "../../components/AdvanceSearch";
import startCase from "lodash/startCase";
import { generateAdvanceFilterURL } from "../../util/utils";

const { Panel } = Collapse;

const NameWithInfo = ({ name, created_by, created, updated, updated_by }) => {
  if (name) {
    name = name.split(" - ");
    name = name.map((n) => startCase(n));
    name = name.join(" - ");
  }
  let data = [{ text: "Created", date: created, by: created_by }];
  if (updated) {
    data = [...data, { text: "Updated", date: updated, by: updated_by }];
  }
  return (
    <Space>
      <Popover
        placement="left"
        content={
          <List
            size="small"
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.date} - ${item.by}`}
                  description={item.text}
                />
              </List.Item>
            )}
          />
        }
        title={name}
      >
        <InfoCircleOutlined />
      </Popover>
      {name}
    </Space>
  );
};

const Main = ({ match }) => {
  const history = useHistory();
  const {
    user,
    reloadData,
    selectedAdministration,
    advanceSearchValue,
  } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [questionGroup, setQuestionGroup] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [lastSubmitted, setLastSubmitted] = useState({ by: "", at: "" });

  const current = config?.[match.params.page];
  const changePage = (p) => {
    setPage(p);
    setLoading(true);
  };

  useEffect(() => {
    if (user && current?.formId) {
      setPage(1);
      setPerPage(10);
      api.get(`form/${current.formId}`).then((d) => {
        setQuestionGroup(d.data.question_group);
        UIState.update((s) => {
          s.editedRow = {};
        });
      });
    }
  }, [user, current]);

  useEffect(() => {
    if (user && current && reloadData) {
      const adminId = takeRight(selectedAdministration)[0];
      setLoading(true);
      let url = `data/form/${current.formId}?page=${page}&perpage=${perPage}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      api
        .get(url)
        .then((d) => {
          const tableData = d.data.data.map((x) => {
            const values = current?.values?.reduce((o, key) => {
              const ans = x.answer.find((a) => a.question === key);
              const q = current.columns.find((c) => c.key === key);
              let value = ans?.value;
              if (q?.fn && value) {
                value = q.fn(value);
              }
              if (!q?.fn && value) {
                value = startCase(value);
              }
              return Object.assign(o, {
                [key]: value,
              });
            }, {});
            return {
              key: x.id,
              name: <NameWithInfo {...x} />,
              detail: x.answer,
              ...values,
            };
          });
          setData(tableData);
          setTotal(d.data.total);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setTotal(0);
          setLoading(false);
        });
    }
  }, [
    page,
    perPage,
    user,
    current,
    reloadData,
    selectedAdministration,
    advanceSearchValue,
  ]);

  useEffect(() => {
    if (user && current) {
      const adminId = takeRight(selectedAdministration)[0];
      let url = `last-submitted?form_id=${current.formId}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      api
        .get(url)
        .then((res) => {
          setLastSubmitted(res.data);
        })
        .catch(() => {
          setLastSubmitted({ by: "", at: "" });
        });
    }
  }, [user, current, selectedAdministration, advanceSearchValue]);

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
              <DropdownNavigation
                value={match?.params?.page}
                onChange={(val) => history.push(`/data/${val}`)}
              />
              <SelectLevel />
            </Space>
            <AdvanceSearch
              formId={current?.formId}
              questionGroup={questionGroup}
            />
          </Col>
        </Row>
      </Col>
      {/* Data View */}
      <Col span={24}>
        <Row align="top" className="data-container" wrap={true}>
          <Col span={12} xxl={10} className="map-wrapper">
            <div className="container">
              <MainMaps
                geoUrl={ethGeoUrl}
                mapHeight={660}
                question={questionGroup
                  .map((q) => q.question)
                  .flatMap((x) => x)}
                current={current}
              />
            </div>
          </Col>
          <MainTable
            span={12}
            current={current}
            loading={loading}
            data={data}
            questionGroup={questionGroup}
            dataSource={data}
            total={total}
            setPerPage={setPerPage}
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
