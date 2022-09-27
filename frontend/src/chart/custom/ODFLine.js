import {
  Color,
  TextStyle,
  backgroundColor,
  Title,
  AxisLabelFormatter,
  NoData,
} from '../chart-style.js';
import moment from 'moment';

const ODFLine = (data, chartTitle, extra) => {
  if (!data?.yAxis?.length) {
    return NoData;
  }
  const option = {
    title: {
      ...Title,
      show: chartTitle ? true : false,
      text: chartTitle?.title,
      subtext: chartTitle?.subTitle,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (p) => {
        const start = p[0].dataIndex === 0;
        const sentences = p.reverse().map((d) => {
          const v = d.data.data;
          const title = start
            ? 'Trigered ODF'
            : v.endValue
            ? 'Verified ODF'
            : 'On Going';
          let date = start ? v.startDate : v.endDate;
          date = moment(date._d).format('DD MMM, YY');
          const value = start ? v.startValue : v.endValue;
          return [
            "<div class='tooltip-odf'><span class='odf-badge ",
            title.toLowerCase(),
            "'>",
            title,
            ' @ ',
            date,
            '</span> ',
            v.name,
            ' (',
            value || v.startValue,
            ')</div>',
          ]
            .filter((x) => x)
            .join('');
        });
        return sentences.join('');
      },
    },
    grid: {
      top: '20px',
      left: '20px',
      bottom: '20px',
      containLabel: true,
      label: {
        color: '#000',
        ...TextStyle,
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis,
      axisLabel: {
        ...AxisLabelFormatter,
        color: 'rgba(0, 0, 0, 0.85)',
        fontWeight: 'normal',
        fontSize: '12px',
        padding: [10, 0, 0, 0],
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'category',
      data: data.yAxis,
      axisLine: {
        show: false,
      },
      splitArea: {
        show: true,
      },
      axisLabel: {
        ...AxisLabelFormatter,
        color: 'rgba(0, 0, 0, 0.85)',
        fontWeight: 'normal',
        fontSize: '12px',
      },
      axisTick: {
        show: false,
      },
    },
    series: data.series.map((x) => {
      return {
        type: 'line',
        data: x.data.map((g, gi) => ({
          value: g,
          data: x,
          label: {
            position: gi === 0 ? 'left' : 'right',
            color: gi === 0 ? '#1890ff' : '#00989f',
          },
        })),
        itemStyle: {
          color: (p) => {
            const start = p.dataIndex === 0;
            return start
              ? '#1890ff'
              : p.data.data.endValue
              ? '#00989f'
              : '#a4a4a4';
          },
        },
        lineStyle: {
          width: 2,
          color: '#a4a4a4',
        },
        label: {
          show: false,
        },
        symbol: 'circle',
        symbolSize: 7,
      };
    }),
    animation: false,
    ...Color,
    ...backgroundColor,
    ...extra,
  };
  return option;
};

export default ODFLine;
