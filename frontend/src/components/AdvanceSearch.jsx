import React, { useState, useEffect } from "react";
import {
  Collapse,
  Button,
  Tag,
  Space,
  Select,
  Radio,
  Popover,
  Checkbox,
} from "antd";
import { FilterOutlined, InfoCircleOutlined } from "@ant-design/icons";

import { UIState } from "../state/ui";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import flatten from "lodash/flatten";

const { Panel } = Collapse;
const { mainText, buttonText } = window?.i18n;

const AdvanceSearch = ({
  formId,
  questionGroup,
  setPage,
  setSelectedRow,
  buttonPos = "left",
  customStyle = {},
}) => {
  // Get question option only
  const question = flatten(
    questionGroup.map((qg) =>
      qg.question.filter(
        (q) => q.type === "option" || q.type === "multiple_option"
      )
    )
  );

  const { user, advanceSearchValue } = UIState.useState((s) => s);
  const [selectedPanel, setSelectedPanel] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState([]);

  const handleOnChangeQuestionDropdown = (id) => {
    const filterQuestion = question.find((q) => q.id === id);
    setSelectedQuestion(filterQuestion);
  };

  const handleOnChangeQuestionOption = (value, type) => {
    setPage(1);
    if (setSelectedRow) {
      setSelectedRow([]);
    }
    const filterAdvanceSearchValue = advanceSearchValue.filter(
      (x) => x.qid !== selectedQuestion?.id
    );
    let updatedValue = [
      {
        qid: selectedQuestion?.id,
        question: selectedQuestion?.name,
        option: value,
        type: type,
      },
    ];
    if (type === "multiple_option") {
      updatedValue = value.length ? updatedValue : [];
    }
    UIState.update((s) => {
      s.advanceSearchValue = [...filterAdvanceSearchValue, ...updatedValue];
    });
    setSelectedPanel([]);
  };

  useEffect(() => {
    // Reset state
    if (user && formId) {
      UIState.update((s) => {
        s.advanceSearchValue = [];
      });
      setSelectedPanel([]);
      setSelectedQuestion([]);
    }
  }, [user, formId]);

  return (
    <div className="advance-search-container" style={customStyle}>
      {/* Question filter */}
      <Collapse
        ghost
        collapsible="header"
        className="advance-search-collapse"
        activeKey={selectedPanel}
        onChange={(e) => setSelectedPanel(e)}
      >
        <Panel
          className="advance-search-panel"
          header={
            <Button style={{ float: buttonPos }} icon={<FilterOutlined />}>
              {buttonText?.btnAdvancedFilter}
            </Button>
          }
          showArrow={false}
          key="advance-search"
        >
          <Space
            direction="vertical"
            className="search-question-option-wrapper"
            size="middle"
          >
            <Select
              showSearch
              placeholder={mainText?.advanceSearchSelectOptionPlaceholder}
              className="search-question-select"
              options={question.map((q) => ({
                label: q.name,
                value: q.id,
              }))}
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={!isEmpty(selectedQuestion) ? [selectedQuestion?.id] : []}
              onChange={handleOnChangeQuestionDropdown}
            />
            {!isEmpty(selectedQuestion) && (
              <RenderQuestionOption
                selectedQuestion={selectedQuestion}
                handleOnChangeQuestionOption={handleOnChangeQuestionOption}
              />
            )}
          </Space>
        </Panel>
      </Collapse>
      {/* Tags of selected filter */}
      {!isEmpty(advanceSearchValue) && (
        <RenderFilterTag setPage={setPage} setSelectedRow={setSelectedRow} />
      )}
    </div>
  );
};

const RenderQuestionOption = ({
  selectedQuestion,
  handleOnChangeQuestionOption,
}) => {
  const { advanceSearchValue } = UIState.useState((s) => s);
  const selectedRadioValue = advanceSearchValue.find(
    (x) => x.qid === selectedQuestion?.id
  );

  const OptionToRender = ({ questionId, option }) => {
    return sortBy(option, "order").map((opt) => (
      <Radio key={`${opt.id}-${opt.name}`} value={`${questionId}|${opt.name}`}>
        {opt.name}
      </Radio>
    ));
  };

  const MultipleOptionToRender = ({ questionId, option }) => {
    return sortBy(option, "order").map((opt) => (
      <Checkbox
        key={`${opt.id}-${opt.name}`}
        value={`${questionId}|${opt.name}`}
      >
        {opt.name}
      </Checkbox>
    ));
  };

  if (selectedQuestion?.type === "multiple_option") {
    return (
      <Checkbox.Group
        key={`${selectedQuestion.id}-${selectedQuestion.name}`}
        value={selectedRadioValue?.option}
        onChange={(e) =>
          handleOnChangeQuestionOption(e, selectedQuestion?.type)
        }
      >
        <Space direction="vertical">
          <MultipleOptionToRender
            option={selectedQuestion.option}
            questionId={selectedQuestion.id}
          />
        </Space>
      </Checkbox.Group>
    );
  }

  return (
    <Radio.Group
      key={`${selectedQuestion.id}-${selectedQuestion.name}`}
      value={selectedRadioValue?.option}
      onChange={(e) =>
        handleOnChangeQuestionOption(e.target.value, selectedQuestion?.type)
      }
    >
      <Space direction="vertical">
        <OptionToRender
          questionId={selectedQuestion.id}
          option={selectedQuestion.option}
        />
      </Space>
    </Radio.Group>
  );
};

const RenderFilterTag = ({ setPage, setSelectedRow }) => {
  const { advanceSearchValue } = UIState.useState((s) => s);

  const handleOnCloseTag = (type, option) => {
    setPage(1);
    if (setSelectedRow) {
      setSelectedRow([]);
    }
    let deleteFilter = [];
    if (type === "option") {
      deleteFilter = advanceSearchValue.filter((x) => x.option !== option);
    }
    if (type === "multiple_option") {
      deleteFilter = advanceSearchValue
        .map((x) => {
          const filterOpt = x.option.filter((opt) => opt !== option);
          if (x.option.includes(option)) {
            return {
              ...x,
              option: filterOpt.length ? filterOpt : null,
            };
          }
          return x;
        })
        .filter((x) => x.option);
    }
    UIState.update((s) => {
      s.advanceSearchValue = deleteFilter;
    });
  };

  const TagToRender = () => {
    return advanceSearchValue.map((val) => {
      if (val.type === "multiple_option") {
        return val.option.map((opt) => (
          <Tag
            key={`tag-${opt}`}
            icon={
              <Popover title={val.question} placement="topRight">
                <InfoCircleOutlined />
              </Popover>
            }
            closable
            onClose={(e) => handleOnCloseTag(val.type, opt)}
          >
            {opt.split("|")[1]}
          </Tag>
        ));
      }
      return (
        <Tag
          key={`tag-${val.option}`}
          icon={
            <Popover title={val.question} placement="topRight">
              <InfoCircleOutlined />
            </Popover>
          }
          closable
          onClose={(e) => handleOnCloseTag(val.type, val.option)}
        >
          {val.option.split("|")[1]}
        </Tag>
      );
    });
  };

  return (
    <Space size="middle" align="center" wrap>
      <TagToRender />
    </Space>
  );
};

export default AdvanceSearch;
