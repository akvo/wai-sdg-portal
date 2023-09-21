import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { unmountComponentAtNode } from 'react-dom';
import TabJMP from '../TabJMP';
import { UIState } from '../../../../state/ui';

const chartList = [
  {
    question: 'water',
  },
];
const chartData = {
  current: 1,
  data: [
    {
      administration: 1,
      child: [
        {
          option: 'No service',
          count: 50,
          percent: 50,
          color: '#ffda46',
        },
        {
          option: 'Limited',
          count: 15,
          percent: 15,
          color: '#fff176',
        },
        {
          option: 'Basic',
          count: 35,
          percent: 35,
          color: '#00b8ec',
        },
      ],
    },
    {
      administration: 2,
      child: [
        {
          option: 'No service',
          count: 5,
          percent: 50,
          color: '#ffda46',
        },
        {
          option: 'Limited',
          count: 0,
          percent: 0,
          color: '#fff176',
        },
        {
          option: 'Basic',
          count: 5,
          percent: 50,
          color: '#00b8ec',
        },
      ],
    },
  ],
  total: 100,
  total_page: 1,
  question: 'water',
  scores: [
    ['No service', -1],
    ['Limited', 1],
    ['Basic', 10],
  ],
};

jest.mock('../../../../util/api', () => {
  return {
    get: () => new Promise((resolve) => resolve({ data: chartData })),
  };
});

const mockStackBar = jest.fn();
jest.mock('../StackBarChart', () => (props) => {
  mockStackBar(props);
  return <mock-stackBarComponent />;
});

describe('TabJMP', () => {
  let container = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
  });

  beforeAll(() => {
    UIState.update((s) => {
      s.user = {
        id: 1,
        given_name: 'John',
      };
      s.administration = [
        { id: 1, parent: null, name: 'Barguna' },
        { id: 2, parent: null, name: 'Satkhira' },
        { id: 3, parent: 2, name: 'Agardari Union' },
        { id: 4, parent: 1, name: 'Amtali Paurashava' },
      ];
      s.loadedFormId = 1;
    });
  });
  it('should render correctly & match snapshot', () => {
    const component = renderer.create(
      <TabJMP
        chartList={chartList}
        formId={1}
        show={true}
      />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should call initial data chart API', async () => {
    await act(async () =>
      render(
        <TabJMP
          chartList={chartList}
          formId={1}
          show={true}
        />,
        container
      )
    );
    const api = {
      get: jest.fn((url) => Promise.resolve({ data: chartData })),
    };
    const apiURL =
      '/api/chart/jmp-data/1/water?administration=0&page=1&perpage=250';
    await act(async () => {
      await api.get(apiURL);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(apiURL);
    });
  });

  it('should show chart title when data exists', async () => {
    await act(async () =>
      render(
        <TabJMP
          chartList={chartList}
          formId={1}
          show={true}
        />,
        container
      )
    );

    await waitFor(() => {
      const titleEl = screen.getByText(/Water/i);
      expect(titleEl).toBeInTheDocument();
    });
  });

  it('should pass the data to stackBar component', async () => {
    await act(async () =>
      render(
        <TabJMP
          chartList={chartList}
          formId={1}
          show={true}
        />,
        container
      )
    );

    await waitFor(() => {
      expect(mockStackBar).toHaveBeenCalledWith(
        expect.objectContaining({
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
        })
      );
    });
  });
});
