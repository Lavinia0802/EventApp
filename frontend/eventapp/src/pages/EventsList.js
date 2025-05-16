import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Only fetch events when auth is ready
        if (!authLoading) {
          const response = await eventsApi.getAll();
          setEvents(response.data);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        setLoading(false);
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, [authLoading]);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    setDeleteLoading(true);
    try {
      await eventsApi.delete(eventToDelete._id);
      setEvents(events.filter((event) => event._id !== eventToDelete._id));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Show loading while either component or authentication is loading
  if (loading || authLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Events</h1>
        <Link to="/events/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i> Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-5">
          <h3 className="text-muted">You haven't created any events yet</h3>
          <p className="lead">Create your first event to get started!</p>
          <Link to="/events/create" className="btn btn-primary btn-lg mt-3">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {events.map((event) => (
            <div className="col" key={event._id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{event.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {new Date(event.date).toLocaleDateString()}
                  </h6>
                  <p className="card-text">{event.description}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt"></i> {event.location}
                    </small>
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      <i className="bi bi-images"></i>{" "}
                      {event.photos?.length || 0} photos
                    </small>
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between mb-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn btn-outline-primary"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/events/${event._id}/qr`}
                      className="btn btn-outline-success"
                    >
                      QR Code
                    </Link>
                  </div>
                  <div className="d-flex justify-content-between">
                    <Link
                      to={`/events/${event._id}/edit`}
                      className="btn btn-outline-secondary w-100 me-1"
                    >
                      <i className="bi bi-pencil-square me-1"></i> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(event)}
                      className="btn btn-outline-danger w-100 ms-1"
                    >
                      <i className="bi bi-trash me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ pointerEvents: "auto" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div
                className={`modal-content ${
                  theme === "dark" ? "bg-dark text-light" : ""
                }`}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancelDelete}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete the event "
                    {eventToDelete?.title}"? This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete Event"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default EventsList;
