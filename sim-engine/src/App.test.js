import { render, screen } from '@testing-library/react';
import App from './App';

test('renders world history simulation engine', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/World History Simulator/i);
  expect(titleElements.length).toBeGreaterThan(0);
  expect(titleElements[0]).toBeTruthy();
});
