import renderer from 'react-test-renderer';
import StackBarChart from '../StackBarChart';

describe('StackBarChart', () => {
  it('should render correctly & match snapshot', () => {
    const component = renderer.create(<StackBarChart />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.todo('should call pagination API');
});
