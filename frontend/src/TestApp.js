import { MemoryRouter } from 'react-router-dom';
import App from './App';

const TestApp = ({ entryPoint = '/' }) => {
  return (
    <MemoryRouter initialEntries={[entryPoint]}>
      <App />
    </MemoryRouter>
  );
};

export default TestApp;
