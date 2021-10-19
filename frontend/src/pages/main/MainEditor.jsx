import React, { useState } from "react";
import { Row, Col, Button, Select, InputNumber, Input } from "antd";

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
  return (
    <div onClick={() => setFieldActive(true)}>{newValue || value || " - "}</div>
  );
};

export default MainEditor;
