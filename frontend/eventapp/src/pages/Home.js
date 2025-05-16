import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="display-4 mb-4">Welcome to Event Gallery</h1>
        <p className="lead mb-4">
          Create events and collect photos from your guests without requiring
          them to create an account. All they need to do is scan a QR code!
        </p>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-body text-center">
                <h3 className="card-title">How It Works</h3>
                <div className="row my-4">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <i className="bi bi-calendar-plus fs-1"></i>
                    </div>
                    <h5>1. Create an Event</h5>
                    <p className="text-muted">
                      Log in and create a new event for your gathering
                    </p>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <i className="bi bi-qr-code fs-1"></i>
                    </div>
                    <h5>2. Share QR Code</h5>
                    <p className="text-muted">
                      Share the generated QR code with your guests
                    </p>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <i className="bi bi-images fs-1"></i>
                    </div>
                    <h5>3. Collect Photos</h5>
                    <p className="text-muted">
                      Guests scan the code and upload their photos
                    </p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <Link to="/events/create" className="btn btn-primary btn-lg">
                    Create Event
                  </Link>
                ) : (
                  <button onClick={login} className="btn btn-primary btn-lg">
                    Get Started - Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3>Already have a QR code?</h3>
          <Link to="/upload" className="btn btn-secondary btn-lg mt-3">
            Scan QR & Upload Photos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
