import {
  Easing,
  Color,
  TextStyle,
  backgroundColor,
  Icons,
  AxisLabelFormatter,
  Legend,
  DataView,
  Title,
  axisTitle,
  NoData,
} from './chart-style.js';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';

const chartText = window?.i18n?.chartText;

const SplitBar = (data, chartTitle, extra) => {
  if (isEmpty(data) || !data) {
    return NoData;
  }

  // Custom Axis Title
  const { xAxisTitle, yAxisTitle } = axisTitle(extra);

  let stacked = data.flatMap((d) =>
    d.stack.map((x) => ({ name: x.name, color: x.color }))
  );
  stacked = uniqBy(stacked, 'name');
  const legends = stacked.map((s, si) => ({
    name: s.name,
    itemStyle: { color: s.color || Color.color[si] },
  }));
  const dataSource = uniq(data.map((x) => x.name));

  // remap series to split bar
  const series = stacked.map((s) => {
    const temp = data.map((d) => {
      const val = d.stack.find(
        (c) => c.name.toLowerCase() === s.name.toLowerCase()
      );
      return {
        name: val?.name || null,
        value: val?.value || 0,
        itemStyle: { color: val?.color || s.color },
      };
    });
    return {
      name: s.name,
      type: 'bar',
      barGap: 0,
      barWidth: 25,
      barMaxWidth: 50,
      label: {
        show: true,
        formatter: '{a}: {c}',
        colorBy: 'data',
        position: 'insideLeft',
        padding: 5,
        backgroundColor: 'rgba(0,0,0,.3)',
        ...TextStyle,
        color: '#fff',
      },
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
      top: 'bottom',
      left: 'center',
    },
    grid: {
      top: '175px',
      left: '15%',
      bottom: '150px',
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
    toolbox: {
      show: true,
      orient: 'vertical',
      right: 15,
      top: 'top',
      feature: {
        saveAsImage: {
          type: 'jpg',
          title: chartText?.btnSaveImage,
          icon: Icons.saveAsImage,
          backgroundColor: '#EAF5FB',
        },
        dataView: {
          ...DataView,
          optionToContent: function (opt) {
            var yAxis = opt.yAxis.map((x) => x.data)[0];
            var series = opt.series.map((x) => x.data);
            var table =
              '<table border="1" style="width:90%;text-align:center">';
            table += '<thead><tr><th></th>';
            for (var a = 0, b = yAxis?.length || 0; a < b; a++) {
              table += '<th>' + upperFirst(yAxis[a]) + '</th>';
            }
            table += '</tr></thead><tbody>';
            for (var i = 0, l = series.length; i < l; i++) {
              table += '<tr>';
              table += '<td><b>' + upperFirst(series[i][0].name) + '</b></td>';
              for (var x = 0, y = series[i].length; x < y; x++) {
                table += '<td>' + series[i][x].value + '</td>';
              }
              table += '</tr>';
            }
            table += '</tbody></table>';
            return (
              '<div style="display:flex;align-items:center;justify-content:center">' +
              table +
              '</div>'
            );
          },
        },
      },
    },
    xAxis: {
      type: 'value',
      name: xAxisTitle || '',
      nameTextStyle: { ...TextStyle },
      nameLocation: 'middle',
      nameGap: 50,
    },
    yAxis: {
      data: dataSource,
      type: 'category',
      name: yAxisTitle || '',
      nameTextStyle: { ...TextStyle },
      nameLocation: 'end',
      nameGap: 15,
      axisLabel: {
        color: '#222',
        ...TextStyle,
        ...AxisLabelFormatter,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    series: series,
    ...Color,
    ...backgroundColor,
    ...Easing,
    ...extra,
  };
  return option;
};

export default SplitBar;
