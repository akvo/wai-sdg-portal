import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
  Select,
  InputNumber,
  Input,
  DatePicker,
  Popover,
  Typography,
} from 'antd';
import { UndoOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';
import { pickBy } from 'lodash';
import { UIState } from '../../state/ui';

const { Option } = Select;
const { Text } = Typography;
const { buttonText } = window.i18n;
const defInputNumberPopoverState = { visible: [], content: '' };

const MainEditor = ({ value, question, edited, dataPointId }) => {
  const [fieldActive, setFieldActive] = useState(null);
  const [newValue, setNewValue] = useState(null);
  const [inputNumberPopover, setInputNumberPopover] = useState(
    defInputNumberPopoverState
  );

  const onSave = (question) => {
    const { type, rule } = question;
    if (type === 'number' && rule) {
      const { min, max } = rule;
      const isNotInRange = max
        ? newValue < min || newValue > max
        : newValue < min;
      setInputNumberPopover({
        visible: isNotInRange,
        content: (
          <Text type="danger">
            {max ? `range : ${[min, max].join(' - ')}` : `min : ${min}`}
          </Text>
        ),
      });
      if (isNotInRange) {
        setNewValue(value);
        setTimeout(() => {
          setInputNumberPopover({ defInputNumberPopoverState });
        }, 1500);
        return;
      }
    }

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
      <Row
        className="editor"
        justify="space-around"
        align="middle"
      >
        <Col span={18}>
          {question.type === 'option' ? (
            <Select
              defaultValue={newValue || value || null}
              style={{ width: '100%' }}
              onChange={setNewValue}
              size="small"
            >
              {question.option.map((o, oi) => (
                <Option
                  key={oi}
                  value={o.name}
                >
                  {o.name}
                </Option>
              ))}
            </Select>
          ) : question.type === 'multiple_option' ? (
            <Select
              defaultValue={newValue || value || null}
              style={{ width: '100%' }}
              onChange={setNewValue}
              size="small"
              mode="multiple"
            >
              {question.option.map((o, oi) => (
                <Option
                  key={oi}
                  value={o.name}
                >
                  {o.name}
                </Option>
              ))}
            </Select>
          ) : question.type === 'date' ? (
            <DatePicker
              size="small"
              defaultValue={moment(newValue || value, 'YY-MM-DD')}
              onChange={(d, ds) => setNewValue(ds)}
            />
          ) : question.type === 'number' ? (
            <Popover
              placement="top"
              title={inputNumberPopover.content}
              visible={inputNumberPopover.visible}
            >
              <InputNumber
                value={newValue || value}
                onChange={setNewValue}
                size="small"
              />
            </Popover>
          ) : (
            <Input
              size="small"
              value={newValue || value}
              onChange={(e) => setNewValue(e.target.value)}
            />
          )}
        </Col>
        <Col span={6}>
          <Button
            size="small"
            onClick={() => onSave(question)}
            icon={<SaveOutlined />}
          >
            {buttonText?.btnSave}
          </Button>
        </Col>
      </Row>
    );
  }

  if (question.type === 'date') {
    let dateValue = newValue || value;
    if (dateValue) {
      dateValue = dateValue.split(' ')[0];
      if (edited?.[question.id]) {
        return (
          <Row
            justify="space-around"
            align="middle"
          >
            <Col span={18}>
              <div onClick={() => setFieldActive(true)}>{dateValue}</div>
            </Col>
            <Col span={6}>
              <Button
                size="small"
                onClick={onReset}
                icon={<UndoOutlined />}
              >
                {buttonText?.btnUndo}
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
      <Row
        justify="space-around"
        align="middle"
      >
        <Col span={18}>
          <div onClick={() => setFieldActive(true)}>
            {question.type !== 'multiple_option'
              ? newValue
              : newValue.join(', ')}
          </div>
        </Col>
        <Col span={6}>
          <Button
            size="small"
            onClick={onReset}
            icon={<UndoOutlined />}
          >
            {buttonText?.btnUndo}
          </Button>
        </Col>
      </Row>
    );
  }

  return (
    <div onClick={() => setFieldActive(true)}>
      {value
        ? question.type !== 'multiple_option'
          ? value
          : value.join(', ')
        : '-'}
    </div>
  );
};

export default MainEditor;
