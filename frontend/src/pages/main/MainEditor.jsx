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
import { UndoOutlined } from "@ant-design/icons";
import moment from "moment";
import pickBy from "lodash/pickBy";

const { Option } = Select;

const MainEditor = ({ value, question, edited, setEdited }) => {
  const [fieldActive, setFieldActive] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const onSave = () => {
    setFieldActive(false);
    setEdited({ ...edited, [question.id]: newValue });
  };

  const onReset = () => {
    setEdited(
      pickBy(edited, (v, k) => {
        return parseInt(k) !== question.id;
      })
    );
  };
  if (fieldActive) {
    return (
      <Row className="editor" justify="space-around">
        <Col span={20}>
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
          ) : question.type === "date" ? (
            <DatePicker
              defaultValue={moment(newValue || value, "YY-MM-DD")}
              onChange={(d, ds) => setNewValue(ds)}
            />
          ) : question.type === "number" ? (
            <InputNumber value={newValue || value} onChange={setNewValue} />
          ) : (
            <Input
              value={newValue || value}
              onChange={(e) => setNewValue(e.target.value)}
            />
          )}
        </Col>
        <Col span={4}>
          <Button type="link" onClick={onSave}>
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
      <Space>
        <div onClick={() => setFieldActive(true)}>{newValue}</div>
        <Button type="link" onClick={onReset}>
          <UndoOutlined /> Reset
        </Button>
      </Space>
    );
  }
  return <div onClick={() => setFieldActive(true)}>{value || " - "}</div>;
};

export default MainEditor;
