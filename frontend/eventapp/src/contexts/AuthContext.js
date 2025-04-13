import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setAuthToken } from "../utils/api";

// Create context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();

  const [token, setToken] = useState(() => {
    // Try to get token from localStorage on initial load
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setAuthToken(savedToken);
      return savedToken;
    }
    return null;
  });

  // Set auth token when authentication state changes
  useEffect(() => {
    const getToken = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
          setToken(token);
          // Store token in localStorage
          localStorage.setItem("auth_token", token);
        } else {
          setToken(null);
          // Clear token from localStorage
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Error getting authentication token:", error);
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Context value
  const value = {
    isAuthenticated,
    user,
    login: loginWithRedirect,
    logout: () => {
      // Clear token from localStorage before logout
      localStorage.removeItem("auth_token");
      logout({ returnTo: window.location.origin });
    },
    isLoading,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
