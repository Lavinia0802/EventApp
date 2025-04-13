import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { eventsApi, photosApi } from "../utils/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const fetchEventAndPhotos = async () => {
      try {
        // Fetch event details
        const eventResponse = await eventsApi.getById(id);
        setEvent(eventResponse.data);

        // Fetch photos for this event
        const photosResponse = await photosApi.getByEventId(id);
        setPhotos(photosResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to load event details. Please try again later.");
        setLoading(false);
        console.error("Error fetching event details:", err);
      }
    };

    fetchEventAndPhotos();
  }, [id]);

  // Function to download a single image
  const downloadImage = (photo) => {
    try {
      let imageData;
      let fileName = photo.title || `photo-${photo._id}`;

      // Append file extension if not present
      if (!fileName.match(/\.(jpe?g|png|gif)$/i)) {
        fileName += ".jpg";
      }

      if (photo.imageData) {
        // Convert base64 to blob
        const byteString = atob(photo.imageData);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
          int8Array[i] = byteString.charCodeAt(i);
        }

        imageData = new Blob([arrayBuffer], { type: "image/jpeg" });
      } else if (photo.imageUrl) {
        // For URLs, open in new tab as direct download may not work for cross-origin resources
        window.open(photo.imageUrl, "_blank");
        return;
      } else {
        throw new Error("No image data available");
      }

      // Download the image using FileSaver
      saveAs(imageData, fileName);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  // Function to download all images as a ZIP file
  const downloadAllImages = async () => {
    if (photos.length === 0) return;

    setDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const imgFolder = zip.folder(
        `${event.title.replace(/[^a-z0-9]/gi, "_")}_photos`
      );

      // Add each image to the ZIP
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        let fileName = photo.title || `photo-${i + 1}`;

        // Append file extension if not present
        if (!fileName.match(/\.(jpe?g|png|gif)$/i)) {
          fileName += ".jpg";
        }

        if (photo.imageData) {
          imgFolder.file(fileName, photo.imageData, { base64: true });
        } else if (photo.imageUrl) {
          // Fetching image from URL requires extra step
          try {
            const response = await fetch(photo.imageUrl);
            const blob = await response.blob();
            imgFolder.file(fileName, blob);
          } catch (err) {
            console.error(
              `Failed to fetch image from URL: ${photo.imageUrl}`,
              err
            );
            // Continue with other images even if one fails
          }
        }

        // Update progress
        setDownloadProgress(Math.round(((i + 1) / photos.length) * 100));
      }

      // Generate and download the ZIP file
      const zipContent = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          setDownloadProgress(Math.round(metadata.percent));
        }
      );

      const zipFileName = `${event.title.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_photos.zip`;
      saveAs(zipContent, zipFileName);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Failed to download images. Please try again.");
    } finally {
      setDownloading(false);
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="alert alert-warning" role="alert">
        Event not found.
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          {/* Event Details Card */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Event Details</h2>
              <Link to={`/events/${id}/qr`} className="btn btn-light">
                <i className="bi bi-qr-code me-2"></i>
                View QR Code
              </Link>
            </div>
            <div className="card-body">
              <h3 className="card-title">{event.title}</h3>

              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Date: </strong>
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="mb-1">
                    <strong>Location: </strong>
                    {event.location || "No location specified"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Photos: </strong>
                    {photos.length}
                  </p>
                  <p className="mb-1">
                    <strong>Created: </strong>
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {event.description && (
                <div>
                  <h5>Description</h5>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos Section */}
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Event Photos ({photos.length})</h3>
              {photos.length > 0 && (
                <button
                  className="btn btn-light"
                  onClick={downloadAllImages}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      {downloadProgress}%
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Download All
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="card-body">
              {photos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-images fs-1 text-muted"></i>
                  <h4 className="mt-3">No photos yet</h4>
                  <p className="text-muted">
                    Share the QR code with your guests so they can upload
                    photos.
                  </p>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                  {photos.map((photo) => (
                    <div key={photo._id} className="col">
                      <div className="card h-100">
                        {photo.imageData ? (
                          <img
                            src={`data:image/jpeg;base64,${photo.imageData}`}
                            className="card-img-top"
                            alt={photo.title || "Event photo"}
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                        ) : photo.imageUrl ? (
                          <img
                            src={photo.imageUrl}
                            className="card-img-top"
                            alt={photo.title || "Event photo"}
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="card-img-top bg-light d-flex justify-content-center align-items-center"
                            style={{ height: "200px" }}
                          >
                            <i
                              className="bi bi-image text-muted"
                              style={{ fontSize: "3rem" }}
                            ></i>
                          </div>
                        )}
                        <div className="card-body">
                          <h5 className="card-title">
                            {photo.title || "Untitled"}
                          </h5>
                          {photo.description && (
                            <p className="card-text">{photo.description}</p>
                          )}
                          <p className="card-text">
                            <small className="text-muted">
                              Uploaded by: {photo.uploadedBy || "Anonymous"}
                              <br />
                              Date:{" "}
                              {new Date(photo.uploadedAt).toLocaleString()}
                            </small>
                          </p>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => downloadImage(photo)}
                          >
                            <i className="bi bi-download me-1"></i>
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <Link to="/events" className="btn btn-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
