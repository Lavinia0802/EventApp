import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand me-auto" to="/">
          Event Gallery
        </Link>

        <div className="d-flex align-items-center">
          {/* Theme toggle button - visible only on mobile, directly to the left of hamburger */}
          <button
            onClick={toggleTheme}
            className="btn btn-outline-light me-2 d-lg-none"
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <i
              className={`bi ${
                theme === "light" ? "bi-moon-fill" : "bi-sun-fill"
              }`}
            ></i>
          </button>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/events">
                    My Events
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/events/create">
                    Create Event
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/upload">
                Upload Photos
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <div className="d-flex flex-column flex-lg-row align-items-center">
                <span className="navbar-text text-light mb-2 mb-lg-0 me-lg-3">
                  Hello, {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-outline-light w-100 w-lg-auto me-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex justify-content-center">
                <button
                  onClick={login}
                  className="btn btn-outline-light w-100 w-lg-auto me-2"
                >
                  Login
                </button>
              </div>
            )}

            {/* Theme toggle button - visible only on desktop */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline-light d-none d-lg-block"
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <i
                className={`bi ${
                  theme === "light" ? "bi-moon-fill" : "bi-sun-fill"
                }`}
              ></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
