import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { AuthProvider, AuthContext } from "./AuthProvider";

describe("AuthProvider", () => {
  const mockAuthContext = {
    token: null,
    handleAuth: jest.fn(),
    handleExpire: jest.fn(),
  };

  const wrapper = ({ children }) => (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );

  test("renders without error", () => {
    render(
      <AuthProvider>
        <div>Child component</div>
      </AuthProvider>,
      { wrapper }
    );
    const childComponent = screen.getByText("Child component");
    expect(childComponent).toBeInTheDocument();
  });

  test("sets token state correctly", () => {
    const { result } = renderHook(() => useState(null));
    const setToken = result.current[1];
    act(() => {
      setToken("mytoken");
    });
    expect(result.current[0]).toEqual("mytoken");
  });

  test("handleAuth is called when form is submitted", () => {
    const { getByLabelText, getByRole } = render(
      <AuthProvider>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Simulate form submission
          }}
        >
          <label>
            Email:
            <input type="email" name="email" />
          </label>
          <label>
            Password:
            <input type="password" name="password" />
          </label>
          <button type="submit">Submit</button>
        </form>
      </AuthProvider>,
      { wrapper }
    );
    const emailInput = getByLabelText("Email:");
    const passwordInput = getByLabelText("Password:");
    const submitButton = getByRole("button", { name: "Submit" });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);
    expect(mockAuthContext.handleAuth).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
  });

  test("handleExpire is called when token expires", () => {
    jest.useFakeTimers();
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    render(
      <AuthProvider>
        <div>Child component</div>
      </AuthProvider>,
      { wrapper }
    );
    act(() => {
      mockAuthContext.handleSetToken(token);
    });
    expect(mockAuthContext.token).toEqual(token);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockAuthContext.handleExpire).toHaveBeenCalled();
  });
});
