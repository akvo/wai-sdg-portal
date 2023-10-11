import React from 'react';
import { Row, Col, Card, Checkbox } from 'antd';
import ReactECharts from 'echarts-for-react';
import Bar from './Bar';
import Line from './Line';
import BarStack from './BarStack';
import Pie from './Pie';
import JMPBarStack from './custom/JMPBarStack';
import ODFLine from './custom/ODFLine';
import SplitBar from './SplitBar';

const { chartText } = window.i18n;

export const generateOptions = ({ type, data, chartTitle }, extra) => {
  switch (type) {
    case 'LINE':
      return Line(data, chartTitle, extra);
    case 'BARSTACK':
      return BarStack(data, chartTitle, extra);
    case 'SPLITBAR':
      return SplitBar(data, chartTitle, extra);
    case 'PIE':
      return Pie(data, chartTitle, extra);
    case 'DOUGHNUT':
      return Pie(data, chartTitle, extra, true);
    case 'JMP-BARSTACK':
      return JMPBarStack(data, chartTitle, extra);
    case 'ODF-LINE':
      return ODFLine(data, chartTitle, extra);
    default:
      return Bar(data, chartTitle, extra);
  }
};

const EchartWrapper = ({ emptyValueCheckboxSetting, option, height }) => {
  return (
    <Row style={{ width: '100%' }}>
      {emptyValueCheckboxSetting?.show && (
        <Col span={24}>
          <Checkbox
            style={{ float: 'right', marginRight: '15px' }}
            checked={emptyValueCheckboxSetting.checked}
            onChange={emptyValueCheckboxSetting.handleOnCheck}
          >
            {chartText?.showEmptyValueCheckboxText}
          </Checkbox>
        </Col>
      )}
      <Col span={24}>
        <ReactECharts
          option={option}
          style={{ height: height - 50, width: '100%' }}
        />
      </Col>
    </Row>
  );
};

const Chart = ({
  type,
  title = '',
  subTitle = '',
  height = 450,
  span = 12,
  data,
  extra = {},
  wrapper = true,
  axis = null,
  styles = {},
  transform = true,
  emptyValueCheckboxSetting = {
    show: false,
    checked: false,
    handleOnCheck: () => {},
  },
}) => {
  if (transform) {
    data = data.map((x) => ({
      ...x,
      name: x.name,
      var: x.name,
    }));
  }
  const chartTitle = wrapper ? {} : { title: title, subTitle: subTitle };
  const option = generateOptions(
    { type: type, data: data, chartTitle: chartTitle },
    extra,
    axis
  );
  if (wrapper) {
    return (
      <Col
        sm={24}
        md={span * 2}
        lg={span}
        style={{ height: height, ...styles }}
      >
        <Card title={title}>
          <EchartWrapper
            emptyValueCheckboxSetting={emptyValueCheckboxSetting}
            option={option}
            height={height}
          />
        </Card>
      </Col>
    );
  }
  return (
    <EchartWrapper
      emptyValueCheckboxSetting={emptyValueCheckboxSetting}
      option={option}
      height={height}
    />
  );
};

export default Chart;
