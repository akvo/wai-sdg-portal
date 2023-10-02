import React from 'react';
import renderer from 'react-test-renderer';
import { render, waitFor, act } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import 'jest-canvas-mock';
import StackBarChart from '../StackBarChart';

const props = {
  apiUrl: 'chart/jmp-data/1/water?administration=0',
  chartScores: { Basic: 10, Limited: 1, 'No service': -1 },
  data: [
    {
      id: 1,
      name: 'Barguna',
      parent: null,
      score: null,
      stack: [
        {
          color: '#ffda46',
          id: 0,
          name: 'No service',
          order: 1,
          value: 50,
        },
        {
          color: '#fff176',
          id: 1,
          name: 'Limited',
          order: 2,
          value: 15,
        },
        { color: '#00b8ec', id: 2, name: 'Basic', order: 3, value: 35 },
      ],
    },
    {
      id: 2,
      name: 'Satkhira',
      parent: null,
      score: null,
      stack: [
        {
          color: '#ffda46',
          id: 0,
          name: 'No service',
          order: 1,
          value: 50,
        },
        {
          color: '#fff176',
          id: 1,
          name: 'Limited',
          order: 2,
          value: 0,
        },
        { color: '#00b8ec', id: 2, name: 'Basic', order: 3, value: 50 },
      ],
    },
  ],
  height: 100,
  name: 'Water',
  question: 'water',
  selectedAdministration: null,
  totalPages: 1,
};

const paginationData = {
  current: 2,
  data: [
    {
      administration: 1,
      child: [
        {
          option: 'No service',
          count: 0,
          percent: 0,
          color: '#ffda46',
        },
        {
          option: 'Limited',
          count: 3,
          percent: 20.0,
          color: '#fff176',
        },
        {
          option: 'Basic',
          count: 11,
          percent: 73.33333333333333,
          color: '#00b8ec',
        },
      ],
    },
    {
      administration: 2,
      child: [
        {
          option: 'No service',
          count: 0,
          percent: 0,
          color: '#ffda46',
        },
        {
          option: 'Limited',
          count: 37,
          percent: 23.417721518987342,
          color: '#fff176',
        },
        {
          option: 'Basic',
          count: 99,
          percent: 62.65822784810127,
          color: '#00b8ec',
        },
      ],
    },
  ],
  total: 423,
  total_page: 2,
  question: 'water',
  scores: [
    ['No service', -1],
    ['Limited', 1],
    ['Basic', 10],
  ],
};

jest.mock('../../../../util/api', () => {
  return {
    get: () => new Promise((resolve) => resolve({ data: paginationData })),
  };
});

const mockChartComponent = jest.fn();
// eslint-disable-next-line react/display-name
jest.mock('../../../../chart', () => (props) => {
  mockChartComponent(props);
  return <mock-chartComponent />;
});

describe('StackBarChart', () => {
  let container = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
  });

  it('should render correctly & match snapshot', () => {
    const component = renderer.create(<StackBarChart {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should not call pagination callback when totalPages = 1', () => {
    const paginationCallback = jest.fn();
    render(<StackBarChart {...props} />, container);
    expect(paginationCallback).toHaveBeenCalledTimes(0);
  });

  it('should call pagination callback when totalPages > 1', async () => {
    const paginationCallback = jest.fn();
    await act(async () =>
      render(<StackBarChart {...{ ...props, totalPages: 2 }} />, container)
    );
    act(() => {
      paginationCallback();
    });
    await waitFor(() => {
      expect(paginationCallback).toHaveBeenCalledTimes(1);
      expect(mockChartComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            {
              id: 1,
              name: 'Barguna',
              parent: null,
              score: 8.071428571428571,
              stack: [
                {
                  color: '#ffda46',
                  id: 0,
                  name: 'No service',
                  order: 1,
                  value: 0,
                },
                {
                  color: '#fff176',
                  id: 1,
                  name: 'Limited',
                  order: 2,
                  value: 21.42857142857143,
                },
                {
                  color: '#00b8ec',
                  id: 2,
                  name: 'Basic',
                  order: 3,
                  value: 78.57142857142857,
                },
              ],
            },
            {
              id: 2,
              name: 'Satkhira',
              parent: null,
              score: 7.551470588235295,
              stack: [
                {
                  color: '#ffda46',
                  id: 0,
                  name: 'No service',
                  order: 1,
                  value: 0,
                },
                {
                  color: '#fff176',
                  id: 1,
                  name: 'Limited',
                  order: 2,
                  value: 27.205882352941174,
                },
                {
                  color: '#00b8ec',
                  id: 2,
                  name: 'Basic',
                  order: 3,
                  value: 72.79411764705883,
                },
              ],
            },
          ],
          extra: { selectedAdministration: null },
          height: 320,
          subTitle: '',
          title: '',
          type: 'JMP-BARSTACK',
          wrapper: false,
        })
      );
    });
  });
});
