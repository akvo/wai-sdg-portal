import React, { useState, useEffect } from "react";
import { Row, Col, Space, Popover, List, Affix, Card } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import api from "../../util/api";
import { useHistory } from "react-router-dom";

import "./main.scss";
import { SelectLevel, DropdownNavigation } from "../../components/common";
import ErrorPage from "../../components/ErrorPage";
import { UIState } from "../../state/ui";
import takeRight from "lodash/takeRight";
import MainTable from "./MainTable";
import MainMaps from "./MainMaps";
import AdvanceSearch from "../../components/AdvanceSearch";
import MainChart from "./MainChart";
import { generateAdvanceFilterURL } from "../../util/utils";
import startCase from "lodash/startCase";
import flatten from "lodash/flatten";
import isEmpty from "lodash/isEmpty";
import Chart from "../../chart";
import config from "../../config";

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
    historyChart,
  } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [questionGroup, setQuestionGroup] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [lastSubmitted, setLastSubmitted] = useState({ by: "", at: "" });
  const [historyChartData, setHistoryChartData] = useState([]);

  const current = config?.[match.params.page];
  const changePage = (p) => {
    setPage(p);
    setLoading(true);
  };

  useEffect(() => {
    if (!isEmpty(historyChart)) {
      const { dataPointId, questionId, questionType } = historyChart;
      const url = `history/${dataPointId}/${questionId}`;
      api.get(url).then((res) => {
        setHistoryChartData(
          res.data.map((x, i) => ({
            ...x,
            key: `history-${i}`,
            type: questionType,
          }))
        );
      });
    } else {
      setHistoryChartData([]);
    }
  }, [historyChart]);

  useEffect(() => {
    if (user && current?.formId) {
      setPage(1);
      setPerPage(10);
      api.get(`form/${current.formId}`).then((d) => {
        setQuestionGroup(d.data.question_group);
        UIState.update((s) => {
          s.editedRow = {};
          s.historyChart = {};
        });
      });
    }
  }, [user, current]);

  useEffect(() => {
    if (user && current && reloadData && questionGroup) {
      // Get all question
      const question = flatten(questionGroup.map((qg) => qg.question));
      setLoading(true);
      const adminId = takeRight(selectedAdministration)[0];
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
              const option = question.find((qs) => qs.id === key)?.option;
              let color = null;
              if (!isEmpty(option)) {
                color =
                  option.find((opt) => opt.name === value?.toLowerCase())
                    ?.color || null;
              }
              return Object.assign(o, {
                [key]: { value: value, color: color },
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
    questionGroup,
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

  // Get question
  const question = flatten(questionGroup?.map((qg) => qg.question));

  if (!current) {
    return <ErrorPage status={404} />;
  }

  return (
    <Row className="main-container">
      {/* Filter */}
      <Affix style={{ width: "100%", zIndex: 2 }}>
        <Col span={24}>
          <Row align="middle" className="filter-wrapper">
            <Col span={24} className="container">
              <Space size={20} align="center" wrap={true}>
                <DropdownNavigation
                  value={match?.params?.page}
                  onChange={(val) => history.push(`/data/${val}`)}
                />
                <SelectLevel setPage={setPage} />
              </Space>
              <AdvanceSearch
                buttonPos="right"
                customStyle={{ marginTop: "-33px", marginBottom: 0 }}
                formId={current?.formId}
                questionGroup={questionGroup}
                setPage={setPage}
              />
            </Col>
          </Row>
        </Col>
      </Affix>
      {/* Data View */}
      <Col span={24}>
        <Row align="top" className="data-container" wrap={true}>
          <Col span={12} xxl={10} className="map-wrapper">
            <div className="container">
              <MainMaps
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
            page={page}
          />
        </Row>
      </Col>
      {/* History Chart */}
      {!isEmpty(historyChartData) && (
        <Col span={24}>
          <Row align="middle" className="collapse-wrapper">
            <Col span={24} className="container">
              <Card
                className="visual-card-wrapper"
                title="History Chart"
                key="history-chart-card"
              >
                <Chart type="LINE" data={historyChartData} wrapper={false} />
              </Card>
            </Col>
          </Row>
        </Col>
      )}
      {/* Main Chart */}
      <Col span={24}>
        <MainChart current={current} question={question} />
      </Col>
    </Row>
  );
};

export default Main;
