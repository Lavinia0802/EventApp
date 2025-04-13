import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests if available
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// API endpoints for events
export const eventsApi = {
  getAll: () => api.get("/events"),
  getById: (id) => api.get(`/events/${id}`),
  getByQrCode: (code) => api.get(`/events/qr/${code}`),
  create: (eventData) => api.post("/events", eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
};

// API endpoints for photos
export const photosApi = {
  getByEventId: (eventId) => api.get(`/photos/event/${eventId}`),
  getById: (id) => api.get(`/photos/${id}`),
  uploadByQrCode: (qrCode, formData) => {
    const headers = {
      ...api.defaults.headers,
      "Content-Type": "multipart/form-data",
    };

    return axios.post(
      `${api.defaults.baseURL}/photos/upload/${qrCode}`,
      formData,
      { headers }
    );
  },
};

export default api;
