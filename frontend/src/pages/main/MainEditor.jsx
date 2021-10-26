import React, { useState } from "react";
import { Row, Col, Button, Select, InputNumber, Input, DatePicker } from "antd";
import { UndoOutlined, SaveOutlined } from "@ant-design/icons";
import moment from "moment";
import { pickBy, startCase } from "lodash";
import { UIState } from "../../state/ui";

const { Option } = Select;

const MainEditor = ({ value, question, edited, dataPointId }) => {
  const [fieldActive, setFieldActive] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const onSave = () => {
    setFieldActive(false);
    if (newValue !== null) {
      const updatedValue = { ...edited, [question.id]: newValue };
      UIState.update((s) => {
        s.editedRow = { ...s.editedRow, ...{ [dataPointId]: updatedValue } };
      });
    }
  };

  const onReset = () => {
    setNewValue(null);
    const updatedValue = pickBy(edited, (v, k) => {
      return parseInt(k) !== question.id;
    });
    if (Object.keys(updatedValue).length === 0) {
      UIState.update((s) => {
        const removed = pickBy(s.editedRow, (v, k) => {
          return parseInt(k) !== dataPointId;
        });
        s.editedRow = removed;
      });
    } else {
      UIState.update((s) => {
        s.editedRow = { ...s.editedRow, ...{ [dataPointId]: updatedValue } };
      });
    }
  };
  if (fieldActive) {
    return (
      <Row className="editor" justify="space-around" align="middle">
        <Col span={18}>
          {question.type === "option" ? (
            <Select
              defaultValue={newValue || startCase(value) || null}
              style={{ width: "100%" }}
              onChange={setNewValue}
              size="small"
            >
              {question.option.map((o, oi) => (
                <Option key={oi} value={startCase(o.name)}>
                  {startCase(o.name)}
                </Option>
              ))}
            </Select>
          ) : question.type === "date" ? (
            <DatePicker
              size="small"
              defaultValue={moment(newValue || value, "YY-MM-DD")}
              onChange={(d, ds) => setNewValue(ds)}
            />
          ) : question.type === "number" ? (
            <InputNumber
              value={newValue || value}
              onChange={setNewValue}
              size="small"
            />
          ) : (
            <Input
              size="small"
              value={newValue || value}
              onChange={(e) => setNewValue(e.target.value)}
            />
          )}
        </Col>
        <Col span={6}>
          <Button size="small" onClick={onSave} icon={<SaveOutlined />}>
            Save
          </Button>
        </Col>
      </Row>
    );
  }

  if (question.type === "date") {
    let dateValue = newValue || value;
    if (dateValue) {
      dateValue = dateValue.split(" ")[0];
      if (edited?.[question.id]) {
        return (
          <Row justify="space-around" align="middle">
            <Col span={18}>
              <div onClick={() => setFieldActive(true)}>{dateValue}</div>
            </Col>
            <Col span={6}>
              <Button size="small" onClick={onReset} icon={<UndoOutlined />}>
                Undo
              </Button>
            </Col>
          </Row>
        );
      }
      return <div onClick={() => setFieldActive(true)}>{dateValue}</div>;
    }
  }
  if (edited?.[question.id]) {
    return (
      <Row justify="space-around" align="middle">
        <Col span={18}>
          <div onClick={() => setFieldActive(true)}>{startCase(newValue)}</div>
        </Col>
        <Col span={6}>
          <Button size="small" onClick={onReset} icon={<UndoOutlined />}>
            Undo
          </Button>
        </Col>
      </Row>
    );
  }
  return (
    <div onClick={() => setFieldActive(true)}>
      {value ? startCase(value) : "-"}
    </div>
  );
};

export default MainEditor;
