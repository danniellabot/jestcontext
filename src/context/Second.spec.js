import React from 'react';
import axios from 'axios';
import { render, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthProvider';

jest.mock('axios');

const mockAuthContext = {
  token: null,
  handleAuth: jest.fn(),
  handleExpire: jest.fn(),
};

describe('Auth Provider and Context', () => {
  test('handleAuth sets token on successful login', async () => {
    const testToken = '12345';
    axios.post.mockResolvedValueOnce({ data: { token: testToken } });

    let rendered;

    await act(async () => {
      rendered = render(
        <AuthContext.Provider value={mockAuthContext}>
          <div data-testid="login-form">
            <input data-testid="email-input" />
            <input data-testid="password-input" />
            <button data-testid="submit-button" onClick={() => mockAuthContext.handleAuth()}>
              Submit
            </button>
          </div>
        </AuthContext.Provider>
      );
    });

    const emailInput = await rendered.findByTestId('email-input');
    const passwordInput = await rendered.findByTestId('password-input');
    const submitButton = await rendered.findByTestId('submit-button');

    await act(async () => {
      emailInput.value = 'test@example.com';
      passwordInput.value = 'password';
      submitButton.click();
    });

    expect(mockAuthContext.handleAuth).toHaveBeenCalledWith('test@example.com', 'password');
    expect(mockAuthContext.handleSetToken).toHaveBeenCalledWith(testToken);
  });

  test('handleExpire sets token to null after expiration time', async () => {
    let rendered;

    await act(async () => {
      rendered = render(
        <AuthContext.Provider value={mockAuthContext}>
          <div />
        </AuthContext.Provider>
      );
    });

    const testToken = '12345';
    mockAuthContext.handleSetToken(testToken);

    jest.advanceTimersByTime(1001);

    expect(mockAuthContext.handleExpire).toHaveBeenCalled();
    expect(mockAuthContext.token).toBeNull();
  });
});
