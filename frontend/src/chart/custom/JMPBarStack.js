import {
  Color,
  TextStyle,
  backgroundColor,
  AxisLabelFormatter,
  Legend,
  Title,
  NoData,
} from '../chart-style.js';
import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

const JMPBarStack = (data, chartTitle, extra) => {
  if (isEmpty(data) || !data) {
    return NoData;
  }

  const { selectedAdministration } = extra;
  // filter only data with stack
  data = sortBy(
    data.filter((d) => d?.stack?.length),
    ['score']
  );

  let stacked = data.find((d) => d?.stack?.length);
  if (!stacked) {
    return NoData;
  }
  stacked = stacked.stack.map((x) => ({ name: x.name, color: x.color }));
  const legends = stacked.map((s, si) => ({
    name: s.name,
    itemStyle: { color: s.color || Color.color[si] },
  }));
  const xAxis = uniq(data.map((x) => x.name));
  const series = stacked.map((s) => {
    const temp = data.map((d) => {
      const val = d.stack.find((c) => c.name === s.name);
      const opacity = selectedAdministration === d.id ? 1 : 0.5;
      return {
        name: val?.name || null,
        value: val?.value?.toFixed(2) || 0,
        itemStyle: {
          color: val?.color || s.color,
          opacity: selectedAdministration ? opacity : 1,
        },
      };
    });
    return {
      name: s.name,
      type: 'bar',
      stack: 'percent',
      barWidth: 25,
      emphasis: {
        focus: 'series',
      },
      data: temp,
    };
  });
  const option = {
    ...Color,
    title: {
      ...Title,
      show: !isEmpty(chartTitle),
      text: chartTitle?.title,
      subtext: chartTitle?.subTitle,
    },
    legend: {
      ...Legend,
      data: legends,
      top: 'top',
      left: 'center',
    },
    grid: {
      top: '50px',
      left: '120px',
      show: true,
      label: {
        color: '#222',
        ...TextStyle,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: '#ffffff',
      ...TextStyle,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#222',
        ...TextStyle,
        ...AxisLabelFormatter,
        formatter: (x) => {
          return `${x} %`;
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
      max: function (value) {
        return value.max;
      },
    },
    yAxis: {
      data: xAxis,
      type: 'category',
    },
    series: series,
    animation: false,
    ...Color,
    ...backgroundColor,
    ...extra,
  };
  return option;
};

export default JMPBarStack;
