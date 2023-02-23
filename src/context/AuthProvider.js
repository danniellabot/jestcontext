/**
 * We are using the React Context API to create a global state for our application.
 * This is a way to share data between components without having to pass props down
 * the component tree.
 * AuthProvider contains useState hook, handleSetToken, handleAuth, and handleExpire methods.
 */

import React, { useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const handleSetToken = (token) => {
    setToken(token);
  };

  const handleAuth = async (email, password) => {
    try {
      const response = await axios.post("/api/auth", { email, password });
      handleSetToken(response.data.token);
    } catch (error) {
      console.log(error);
    }
  };

  const handleExpire = () => {
    setToken(null);
  };

  useEffect(() => {
    const tokenExpiration = setInterval(() => {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      // eslint-disable-next-line no-lone-blocks
      {
        exp > new Date().getTime() && handleExpire();
      }
    }, 1000);

    return () => clearInterval(tokenExpiration);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, handleAuth, handleExpire }}>
      {children}
    </AuthContext.Provider>
  );
};
