import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { signIn } from 'next-auth/react';
import SignInWithGoogleOrGithub from '@/components/SignInWithGoogleOrGithub';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('SignInWithGoogleOrGithub', () => {
  test('renders the login button', () => {
    render(<SignInWithGoogleOrGithub />);
    const loginButton = screen.getByText('GitHub');
    expect(loginButton).toBeInTheDocument();
  });

  test('calls signIn function with correct parameters when the button is clicked', async () => {
    render(<SignInWithGoogleOrGithub />);
    const loginButton = screen.getByText('GitHub');
    userEvent.click(loginButton);
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('github', {
        callbackUrl: `${window.location.origin}`,
      });
    });
  });
});
