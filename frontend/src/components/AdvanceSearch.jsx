import React, { useState, useEffect } from "react";
import { Collapse, Button, Tag, Space, Select, Radio, Popover } from "antd";
import { FilterOutlined, InfoCircleOutlined } from "@ant-design/icons";

import { UIState } from "../state/ui";
import upperFirst from "lodash/upperFirst";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import flatten from "lodash/flatten";

const { Panel } = Collapse;

const AdvanceSearch = ({ formId, questionGroup }) => {
  // Get question option only
  const question = flatten(
    questionGroup.map((qg) => qg.question.filter((q) => q.type === "option"))
  );

  const { user, advanceSearchValue } = UIState.useState((s) => s);
  const [selectedPanel, setSelectedPanel] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState([]);

  const handleOnChangeQuestionDropdown = (id) => {
    const filterQuestion = question.find((q) => q.id === id);
    setSelectedQuestion(filterQuestion);
  };

  const handleOnChangeQuestionOption = (value) => {
    const filterAdvanceSearchValue = advanceSearchValue.filter(
      (x) => x.qid !== selectedQuestion?.id
    );
    UIState.update((s) => {
      s.advanceSearchValue = [
        ...filterAdvanceSearchValue,
        {
          qid: selectedQuestion?.id,
          question: selectedQuestion?.name,
          option: value,
        },
      ];
    });
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
    <div className="advance-search-container">
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
          header={<Button icon={<FilterOutlined />}>Advance Search</Button>}
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
              placeholder="Type to search..."
              className="search-question-select"
              options={question.map((q) => ({
                label: upperFirst(q.name),
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
      {!isEmpty(advanceSearchValue) && <RenderFilterTag />}
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
      <Radio key={`${opt.id}-${opt.name}`} value={`${questionId}||${opt.name}`}>
        {upperFirst(opt.name)}
      </Radio>
    ));
  };

  return (
    <Radio.Group
      key={`${selectedQuestion.id}-${selectedQuestion.name}`}
      value={selectedRadioValue?.option}
      onChange={(e) => handleOnChangeQuestionOption(e.target.value)}
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

const RenderFilterTag = () => {
  const { advanceSearchValue } = UIState.useState((s) => s);

  const handleOnCloseTag = (option) => {
    const deleteFilter = advanceSearchValue.filter((x) => x.option !== option);
    UIState.update((s) => {
      s.advanceSearchValue = deleteFilter;
    });
  };

  const TagToRender = () => {
    return advanceSearchValue.map((val) => (
      <Tag
        key={`tag-${val.option}`}
        icon={
          <Popover title={upperFirst(val.question)} placement="topRight">
            <InfoCircleOutlined />
          </Popover>
        }
        closable
        onClose={(e) => handleOnCloseTag(val.option)}
      >
        {upperFirst(val.option.split("||")[1])}
      </Tag>
    ));
  };

  return (
    <Space size="middle" align="center" wrap>
      <TagToRender />
    </Space>
  );
};

export default AdvanceSearch;
