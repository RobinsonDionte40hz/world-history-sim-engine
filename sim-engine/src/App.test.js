import { render, screen } from '@testing-library/react';
import App from './App';

test('renders world history simulation engine', () => {
  render(<App />);
  const titleElement = screen.getByText(/World History Simulation Engine/i);
  expect(titleElement).toBeTruthy();
});
