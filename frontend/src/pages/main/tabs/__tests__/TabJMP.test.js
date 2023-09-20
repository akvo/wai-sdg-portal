import renderer from 'react-test-renderer';
import TabJMP from '../TabJMP';

describe('StackBarChart', () => {
  it('should render correctly & match snapshot', () => {
    const chartList = [
      {
        question: 'water',
      },
      {
        question: 'sanitation',
      },
      {
        question: 'hygiene',
      },
    ];
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

  it.todo('should call initial data chart API');
});
