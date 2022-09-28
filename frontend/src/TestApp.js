import { MemoryRouter } from 'react-router-dom';
import App from './App';

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const TestApp = ({ entryPoint = '/' }) => {
  return (
    <MemoryRouter initialEntries={[entryPoint]}>
      <App />
    </MemoryRouter>
  );
};

export default TestApp;
