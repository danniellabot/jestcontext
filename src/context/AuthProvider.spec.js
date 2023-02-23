import * as React from 'react';
import axios from 'axios';
import { render, fireEvent, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthProvider';

// Mock axios to resolve with a mock token
jest.mock('axios');
axios.post.mockResolvedValue({ data: { token: 'mock-token' } });

describe('AuthProvider', () => {
  test('sets token on successful login', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ handleAuth }) => (
            <button data-testid="login-button"
            onClick={() => handleAuth('test@example.com', 'password')}>Login</button>
          )}
        </AuthContext.Consumer>
        <AuthContext.Consumer>
          {({ token }) => <div data-testid="token">{JSON.stringify(token)}</div>}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    // Click the login button
    fireEvent.click(getByTestId('login-button'));

    // Wait for the async operation to complete
    await act(async () => {
      await axios.post();
    });

    expect(getByTestId('token').textContent).toBe(JSON.stringify('mock-token'));
  });

  test('expires token after 1 second', async () => {
    jest.useFakeTimers();

    const { getByTestId, rerender } = render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ token }) => <div data-testid="token">{JSON.stringify(token)}</div>}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(setInterval).toHaveBeenCalledTimes(1);

    // Advance time by 1 second
    jest.advanceTimersByTime(1000);

    expect(getByTestId('token').textContent).toBe(JSON.stringify(null));

    // Stop and clear the interval
    jest.clearAllTimers();

    rerender(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ token }) => <div data-testid="token">{JSON.stringify(token)}</div>}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(setInterval).toHaveBeenCalledTimes(1);

    // Advance time by less than 1 second
    jest.advanceTimersByTime(500);

    expect(getByTestId('token').textContent).toBe(JSON.stringify('mock-token'));

    // Advance time by another 500ms, totaling 1 second
    jest.advanceTimersByTime(500);

    expect(getByTestId('token').textContent).toBe(JSON.stringify(null));
  });
});
