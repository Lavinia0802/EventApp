import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.getById(id);
        const eventData = response.data;

        // Format date from ISO format to YYYY-MM-DD for date input
        const formattedDate = eventData.date
          ? eventData.date.split("T")[0]
          : "";

        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          date: formattedDate,
          location: eventData.location || "",
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load event details. Please try again later.");
        setLoading(false);
        console.error("Error fetching event:", err);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await eventsApi.update(id, formData);
      setSubmitting(false);
      navigate(`/events/${id}`);
    } catch (err) {
      setError("Failed to update event. Please try again.");
      setSubmitting(false);
      console.error("Error updating event:", err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Edit Your Event Details</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      theme === "dark"
                        ? "bg-dark text-light border-secondary"
                        : ""
                    }`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className={`form-control ${
                      theme === "dark"
                        ? "bg-dark text-light border-secondary"
                        : ""
                    }`}
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    className={`form-control ${
                      theme === "dark"
                        ? "bg-dark text-light border-secondary"
                        : ""
                    }`}
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      theme === "dark"
                        ? "bg-dark text-light border-secondary"
                        : ""
                    }`}
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/events/${id}`)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ms-2">Saving...</span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
