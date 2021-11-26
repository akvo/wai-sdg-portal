import React, { useState, useEffect } from "react";
import { Row, Col, Space, Popover, List, Button, Affix } from "antd";
import { InfoCircleOutlined, LineChartOutlined } from "@ant-design/icons";
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
import MainHistoryChart from "./MainHistoryChart";
import { generateAdvanceFilterURL } from "../../util/utils";
import TabContent from "./tabs";
import RowContent from "./rows";
import startCase from "lodash/startCase";
import flatten from "lodash/flatten";
import isEmpty from "lodash/isEmpty";
import config from "../../config";
import moment from "moment";

const NameWithInfo = ({ record, current, question }) => {
  const { id, name, created_by, created, updated, updated_by, answer } = record;
  const hasDefaultHistory = current?.default?.datapoint
    ? answer.map((x) => x.history).includes(true)
    : false;
  let tmpName = name;
  if (tmpName) {
    tmpName = tmpName.split(" - ");
    tmpName = tmpName.map((n) => startCase(n));
    tmpName = tmpName.join(" - ");
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
        title={tmpName}
      >
        <InfoCircleOutlined />
      </Popover>
      {hasDefaultHistory && (
        <LineChartOutlined
          onClick={() => {
            UIState.update((s) => {
              s.historyChart = {
                dataPointId: id,
                question: question?.find(
                  (q) => q.id === current?.default?.datapoint
                ),
              };
            });
          }}
        />
      )}
      {tmpName}
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
    loadedFormId,
  } = UIState.useState((s) => s);
  const [data, setData] = useState([]);
  const [questionGroup, setQuestionGroup] = useState([]);
  const [question, setQuestion] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [lastSubmitted, setLastSubmitted] = useState({ by: "", at: "" });
  const [activeTab, setActiveTab] = useState(null);

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
        // Get all question
        const questionTmp = flatten(
          d.data.question_group?.map((qg) => qg.question)
        );
        setQuestion(questionTmp);
        UIState.update((s) => {
          s.editedRow = {};
          s.historyChart = {};
          s.loadedFormId = current?.formId;
        });
      });
    }
  }, [user, current]);

  const questionLoaded =
    loadedFormId !== null && loadedFormId === current?.formId;

  useEffect(() => {
    if (
      user &&
      current &&
      reloadData &&
      questionGroup &&
      question.length &&
      questionLoaded
    ) {
      // Reset history chart
      UIState.update((s) => {
        s.historyChart = {};
      });
      setLoading(true);
      const adminId = takeRight(selectedAdministration)[0];
      let url = `data/form/${current.formId}?page=${page}&perpage=${perPage}`;
      if (adminId) {
        url += `&administration=${adminId}`;
      }
      // advance search
      url = generateAdvanceFilterURL(advanceSearchValue, url);
      // send question id to get the data score
      if (current?.values?.length) {
        const urlScore = current?.values?.map((v) => `question=${v}`).join("&");
        url += `&${urlScore}`;
      }
      api
        .get(url)
        .then((d) => {
          const tableData = d.data.data.map((x) => {
            const values = current?.values?.reduce((o, key) => {
              const ans = x.answer.find((a) => a.question === key);
              const q = current.columns.find((c) => c.key === key);
              let value = ans?.value;
              const qtype = question.find((qs) => qs.id === q.key)?.type;
              if (q?.fn && value) {
                value = q.fn(value);
              }
              if (!q?.fn && value) {
                value =
                  qtype !== "date"
                    ? startCase(value)
                    : moment(value)?.format("DD MMM, Y");
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
              name: (
                <NameWithInfo
                  record={x}
                  current={current}
                  question={question}
                />
              ),
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
    question,
    questionLoaded,
  ]);

  useEffect(() => {
    if (user && current && questionLoaded) {
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
  }, [
    user,
    current,
    selectedAdministration,
    advanceSearchValue,
    questionLoaded,
  ]);

  useEffect(() => {
    if (current?.tabs && questionLoaded) {
      const defaultTabSelected = current?.tabs?.find((tab) => tab?.selected);
      setActiveTab(defaultTabSelected?.name || "data");
    } else {
      setActiveTab("data");
    }
  }, [user, current, questionLoaded]);

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
              <MainMaps mapHeight={670} question={question} current={current} />
            </div>
          </Col>
          <Col span={12} xxl={14} className="table-wrapper">
            {current?.tabs && (
              <Row
                style={{ margin: "20px 40px 0px" }}
                align="middle"
                justify="center"
              >
                <Col span={24}>
                  <Button
                    onClick={() => setActiveTab("data")}
                    type={activeTab === "data" ? "primary" : "secondary"}
                  >
                    Data
                  </Button>
                  {current.tabs.map((tab, tabIndex) => (
                    <Button
                      key={`tab-${tabIndex}`}
                      onClick={() => setActiveTab(tab.name)}
                      type={activeTab === tab.name ? "primary" : "secondary"}
                    >
                      {tab.name}
                    </Button>
                  ))}
                </Col>
              </Row>
            )}
            {current?.tabs?.map((tab, tabIndex) => (
              <TabContent
                parentLoading={loading}
                show={activeTab === tab.name}
                key={`custom-component-${tabIndex}`}
                current={current}
                question={question}
                activeTab={activeTab}
                self={tab}
                data={data}
              />
            ))}
            <MainTable
              show={activeTab === "data"}
              span={24}
              scroll={current?.tabs ? 275 : 320}
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
          </Col>
        </Row>
      </Col>
      {/* History Chart */}
      {!isEmpty(historyChart) && (
        <Col span={24}>
          <MainHistoryChart current={current} data={data} question={question} />
        </Col>
      )}
      {current?.rows?.map((row, rowIndex) => (
        <Col span={24} key={rowIndex}>
          <RowContent current={current} self={row} />
        </Col>
      ))}
      {/* Main Chart */}
      <Col span={24}>
        <MainChart current={current} question={question} />
      </Col>
    </Row>
  );
};

export default Main;
