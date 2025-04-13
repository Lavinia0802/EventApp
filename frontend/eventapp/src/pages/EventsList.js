import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../utils/api";

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll();
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        setLoading(false);
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
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
                <div className="card-footer bg-transparent d-flex justify-content-between">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
