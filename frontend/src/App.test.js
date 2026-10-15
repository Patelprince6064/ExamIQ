import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders ExamIQ landing page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Landing page brand heading (stable across redesigns)
  const brandElement = screen.getByText(/ExamIQ/i);
  expect(brandElement).toBeInTheDocument();
});
