import { render, screen } from '@testing-library/react';
import TestApp from './TestApp';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

jest.mock('leaflet');
jest.mock('axios');
jest.mock('./util/api', () => {
  return {
    get: () => new Promise((resolve) => resolve({ data: { data: [] } })),
    setToken: () => {},
  };
});

describe('App', () => {
  test('test if the login button exists', async () => {
    await act(async () => render(<TestApp />));
    const linkElement = screen.getByText(/Login or Signup/i);
    expect(linkElement).toBeInTheDocument();
  });
});
