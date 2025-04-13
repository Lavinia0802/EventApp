import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { setAuthToken } from "../utils/api";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useAuth();

  // Ensure token is set in API headers when component mounts and when token changes
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
