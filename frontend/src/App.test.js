import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('shows email/password auth when Firebase is configured', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });
  expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
});
