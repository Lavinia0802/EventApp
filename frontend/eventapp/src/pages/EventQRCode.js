import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { eventsApi } from "../utils/api";
import { QRCodeCanvas } from "qrcode.react";

const EventQRCode = () => {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    // Check if event and QR code were passed via navigation state
    if (location.state?.event && location.state?.qrCode) {
      setEvent(location.state.event);
      setQrCode(location.state.qrCode);
      setLoading(false);
    } else {
      // Fetch event data from API
      const fetchEventData = async () => {
        try {
          const response = await eventsApi.getById(id);
          setEvent(response.data);

          // Generate QR code URL for this event
          // Use shorter URL format to reduce QR code data size
          const qrCodeData = `${window.location.origin}/upload/${response.data.qrCodeData}`;
          setQrCode(qrCodeData);

          setLoading(false);
        } catch (err) {
          setError("Failed to load event data. Please try again later.");
          setLoading(false);
          console.error("Error fetching event:", err);
        }
      };

      fetchEventData();
    }
  }, [id, location.state]);

  const handleDownloadQR = () => {
    const canvas = document.getElementById("event-qr-code");
    if (canvas) {
      try {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${event.title.replace(
          /\s+/g,
          "-"
        )}-qr-code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (err) {
        console.error("Error downloading QR code:", err);
        setQrError(true);
      }
    }
  };

  // Handle QR code rendering error
  const handleQRError = (error) => {
    console.error("QR code error:", error);
    setQrError(true);
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Event QR Code</h2>
            </div>
            <div className="card-body text-center">
              <h3 className="card-title">{event.title}</h3>
              <p className="card-text">
                {new Date(event.date).toLocaleDateString()}
              </p>

              {qrError ? (
                <div className="alert alert-warning mb-4">
                  <p>
                    <strong>Unable to generate QR code.</strong>
                  </p>
                  <p>The URL is too long. Please use this link instead:</p>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={qrCode}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => navigator.clipboard.writeText(qrCode)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="qr-container">
                    <QRCodeCanvas
                      id="event-qr-code"
                      value={qrCode}
                      size={300}
                      level="L"
                      includeMargin={true}
                      className="border p-2"
                      onError={handleQRError}
                    />
                  </div>
                </div>
              )}

              <p className="mb-4">
                Share this QR code with your guests. They can scan it to upload
                photos to your event!
              </p>

              <div className="d-flex justify-content-center gap-3">
                {!qrError && (
                  <button
                    className="btn btn-primary"
                    onClick={handleDownloadQR}
                  >
                    <i className="bi bi-download me-2"></i>
                    Download QR Code
                  </button>
                )}
                <Link to={`/events/${id}`} className="btn btn-secondary">
                  View Event Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventQRCode;
