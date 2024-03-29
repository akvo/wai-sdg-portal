import React, { useState, useEffect } from 'react';
import { Table, Space } from 'antd';
import { LineChartOutlined, HistoryOutlined } from '@ant-design/icons';
import MainEditor from './MainEditor';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import { getLocationName } from '../../util/utils';
import { titleCase } from '../../util/utils.js';

const { mainTableChildText } = window.i18n.tableText;

const changeColBackground = (dt, edited) => {
  if (edited?.[dt.props.question.id]) {
    return {
      props: {
        style: { background: '#fefebe' },
      },
      children: dt,
    };
  }
  return {
    children: dt,
  };
};

const NormalCol = ({ value }) => {
  return value;
};

const HistoryTable = ({ record, data }) => {
  const [historyData, setHistoryData] = useState(null);
  useEffect(() => {
    if (historyData === null) {
      const url = `history/${data.key}/${record.name.props.question.id}`;
      api.get(url).then((res) => {
        const data = res.data.map((x, i) => {
          if (record.name.props.question.type !== 'multiple_option') {
            return { ...x, key: `history-${i}` };
          }
          return { ...x, value: x.value.join(', '), key: `history-${i}` };
        });
        setHistoryData(data);
      });
    }
  }, [historyData, data, record]);
  return (
    <Table
      size="small"
      columns={[
        {
          title: mainTableChildText?.colValue,
          dataIndex: 'value',
          key: 'value',
        },
        {
          title: mainTableChildText?.colDate,
          dataIndex: 'date',
          key: 'date',
          align: 'center',
        },
        {
          title: mainTableChildText?.colUser,
          dataIndex: 'user',
          key: 'user',
          align: 'center',
        },
      ]}
      loading={historyData === null}
      pagination={false}
      dataSource={historyData}
    />
  );
};

const MainTableChild = ({
  questionGroup,
  data,
  size = 'small',
  scroll,
  showHistoryChartBtn = false,
}) => {
  const { editedRow, administration, user } = UIState.useState((e) => e);
  const [expanded, setExpanded] = useState([]);
  const edited = editedRow?.[data.key];
  const childcolumns = [
    {
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (dt) => changeColBackground(dt, edited),
    },
    {
      dataIndex: 'value',
      key: 'value',
      render: (dt) => changeColBackground(dt, edited),
    },
  ];
  const disabledHistory = data.detail.filter((x) => !x.history);

  return questionGroup.map((g, gi) => {
    const source = g.question.map((q, qi) => {
      const answer = data.detail.find((d) => d.question === q.id);
      const nonEditable =
        (user?.role === 'user') |
        (q.type === 'administration') |
        (q.type === 'geo');
      return {
        name: (
          <NormalCol
            value={<div>{titleCase(q.name)}</div>}
            question={q}
            edited={edited}
          />
        ),
        value: nonEditable ? (
          <NormalCol
            value={
              <div>
                {q.type === 'geo' && answer?.value ? (
                  <Space direction="vertical">
                    {answer.value.split('|').map((a, ai) => (
                      <b key={ai}>
                        {ai ? 'Long' : 'Lat'}: {a}
                      </b>
                    ))}
                  </Space>
                ) : q.type === 'administration' && answer?.value ? (
                  getLocationName(answer?.value, administration)
                ) : (
                  ''
                )}
                {(q.type !== 'geo' && answer?.value) ||
                  (q.type !== 'administration' &&
                    answer?.value &&
                    answer.value)}
              </div>
            }
            question={q}
            edited={edited}
          />
        ) : (
          <MainEditor
            value={answer?.value || null}
            question={q}
            edited={edited}
            dataPointId={data.key}
            history={answer?.history}
          />
        ),
        key: qi,
      };
    });
    return (
      <Table
        title={() => <b>{g?.name || ''}</b>}
        className={'main-child-table'}
        size={size}
        scroll={scroll ? { y: scroll } : false}
        key={gi}
        showHeader={false}
        columns={childcolumns}
        dataSource={source}
        pagination={false}
        bordered={false}
        expandedRowKeys={expanded}
        onExpand={(expanded, record) => {
          setExpanded(expanded ? [record.key] : []);
        }}
        expandable={{
          expandIconColumnIndex: 3,
          expandIcon: ({ onExpand, record }) => {
            const { dataPointId, question } = record.value.props;
            let showChartButton = '';
            if (
              showHistoryChartBtn &&
              ['number', 'option'].includes(question.type)
            ) {
              showChartButton = (
                <LineChartOutlined
                  onClick={() => {
                    window.scrollTo({
                      top: 640,
                      left: 0,
                      behavior: 'smooth',
                    });
                    UIState.update((s) => {
                      s.historyChart = {
                        dataPointId: dataPointId,
                        selected: question,
                        disabled: disabledHistory,
                      };
                    });
                  }}
                />
              );
            }
            if (record.value.props.history) {
              return (
                <Space>
                  {showChartButton}
                  <HistoryOutlined onClick={(e) => onExpand(record, e)} />
                </Space>
              );
            }
            return '';
          },
          expandedRowRender: (record) => (
            <HistoryTable
              record={record}
              data={data}
            />
          ),
          rowExpandable: (record) => {
            return record.value.props.history;
          },
        }}
      />
    );
  });
};

export default MainTableChild;
