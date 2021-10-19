import React, { useState } from "react";
import { Row, Col, Button, Select, InputNumber, Input, DatePicker } from "antd";
import moment from "moment";

const { Option } = Select;

const MainEditor = ({ value, question, edited, setEdited }) => {
  const [fieldActive, setFieldActive] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const onSave = () => {
    setFieldActive(false);
    setEdited({ ...edited, [question.id]: newValue });
  };
  if (fieldActive) {
    return (
      <Row>
        <Col>
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
            <Input value={newValue || value} onChange={setNewValue} />
          )}
        </Col>
        <Col>
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
  return (
    <div onClick={() => setFieldActive(true)}>{newValue || value || " - "}</div>
  );
};

export default MainEditor;
