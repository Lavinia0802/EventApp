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

  const [token, setToken] = useState(null);

  // Set auth token when authentication state changes
  useEffect(() => {
    const getToken = async () => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          setAuthToken(token);
          setToken(token);
        } else {
          setToken(null);
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
    logout: () => logout({ returnTo: window.location.origin }),
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
