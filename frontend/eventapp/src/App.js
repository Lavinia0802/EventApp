import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config } from "./utils/auth0-config";

// Pages
import Home from "./pages/Home";
import EventsList from "./pages/EventsList";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventQRCode from "./pages/EventQRCode";
import PhotoUpload from "./pages/PhotoUpload";
import EventDetails from "./pages/EventDetails";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import "./themes.css";

// AppContent component to use theme context
const AppContent = () => {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<PhotoUpload />} />
            <Route path="/upload/:qrCode" element={<PhotoUpload />} />

            {/* Protected routes */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/create"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/edit"
              element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/qr"
              element={
                <ProtectedRoute>
                  <EventQRCode />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="bg-dark text-light py-3 mt-5">
          <div className="container text-center">
            <p className="mb-0">
              Event Gallery &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

function App() {
  // Check if we have a valid cached token from localStorage
  let cacheLocation = "localstorage";
  let useRefreshTokens = true;

  // Adjust cacheLocation based on browser support
  if (typeof window !== "undefined") {
    if (!window.localStorage) {
      cacheLocation = "memory";
    }
  }

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      cacheLocation={cacheLocation}
      useRefreshTokens={useRefreshTokens}
    >
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App;
