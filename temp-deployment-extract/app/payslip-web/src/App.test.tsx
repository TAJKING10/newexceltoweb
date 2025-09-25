import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app successfully', () => {
  render(<App />);
  // Test that the app renders without crashing
  // Look for loading text or any initial content
  const loadingText = screen.getByText(/common.loading/i);
  expect(loadingText).toBeInTheDocument();
});
