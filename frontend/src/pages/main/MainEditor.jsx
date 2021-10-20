import React, { useState } from "react";
import {
  Row,
  Col,
  Button,
  Select,
  InputNumber,
  Space,
  Input,
  DatePicker,
} from "antd";
import { UndoOutlined, SaveOutlined } from "@ant-design/icons";
import moment from "moment";
import { startCase, pickBy } from "lodash";

const { Option } = Select;

const MainEditor = ({ value, question, edited, setEdited }) => {
  const [fieldActive, setFieldActive] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const onSave = () => {
    setFieldActive(false);
    setEdited({ ...edited, [question.id]: newValue });
  };

  const onReset = () => {
    setNewValue(null);
    setEdited(
      pickBy(edited, (v, k) => {
        return parseInt(k) !== question.id;
      })
    );
  };
  if (fieldActive) {
    return (
      <Row className="editor" justify="space-around" align="middle">
        <Col span={18}>
          {question.type === "option" ? (
            <Select
              defaultValue={newValue || value?.toLowerCase() || null}
              style={{ width: "100%" }}
              onChange={setNewValue}
              size="small"
            >
              {question.option.map((o, oi) => (
                <Option key={oi} value={o.name}>
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
  return <div onClick={() => setFieldActive(true)}>{value || " - "}</div>;
};

export default MainEditor;
