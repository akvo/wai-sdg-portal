import { render, screen } from '@testing-library/react';
import TestApp from './TestApp';
import '@testing-library/jest-dom';

jest.mock('leaflet');
// jest.mock('axios');

describe('App', () => {
  test('test if the login button exists', () => {
    render(<TestApp />);
    const linkElement = screen.getByText(/Login or Signup/i);
    expect(linkElement).toBeInTheDocument();
  });
});
