import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useDropzone } from "react-dropzone";
import { eventsApi, photosApi } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const PhotoUpload = () => {
  const { qrCode } = useParams();
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);
  const qrScannerContainerRef = useRef(null);
  const scannerInitializedRef = useRef(false); // Track if scanner has been initialized
  const { isAuthenticated, user } = useAuth();

  const [uploadStep, setUploadStep] = useState(qrCode ? "upload" : "scan");
  const [scannedCode, setScannedCode] = useState(qrCode || "");
  const [event, setEvent] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [userData, setUserData] = useState("");
  const [userDataError, setUserDataError] = useState("");
  const [fileErrors, setFileErrors] = useState([]);

  useEffect(() => {
    // If user is authenticated, use their name
    if (isAuthenticated && user) {
      setUserData(user.name || user.nickname || user.email || "");
    }
  }, [isAuthenticated, user]);

  // Cleanup function for scanner - wrapped in useCallback to prevent recreating on every render
  const cleanupScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
        scannerInitializedRef.current = false; // Reset initialization flag

        // Also remove all qr-reader elements from the DOM
        document.querySelectorAll("#qr-reader").forEach((el) => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (error) {
        console.error("Failed to clear scanner", error);
      }
    }
  }, []);

  // Define scan callbacks before using them in useEffect
  const onScanSuccess = useCallback(
    (decodedText) => {
      // Immediately clean up scanner on success to prevent duplicate scans
      const qrCodeRegex = /\/upload\/([^/]+)$/;
      const match = decodedText.match(qrCodeRegex);

      if (match && match[1]) {
        cleanupScanner(); // Clean up scanner before state change
        setScannedCode(match[1]);
        setUploadStep("upload");
      } else {
        setError("Invalid QR code format. Please scan a valid event QR code.");
      }
    },
    [cleanupScanner]
  );

  const onScanFailure = useCallback((error) => {
    console.warn(`QR scan error: ${error}`);
  }, []);

  useEffect(() => {
    // Initialize scanner only in scan step, when not already initialized
    if (
      uploadStep === "scan" &&
      !scannerInitializedRef.current &&
      qrScannerContainerRef.current
    ) {
      // Make sure we're not duplicating
      cleanupScanner();

      // First, make sure the container is empty
      const container = qrScannerContainerRef.current;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create the qr-reader element programmatically with a unique ID to avoid conflicts
      const uniqueId = "qr-reader-" + Date.now();
      const qrReaderElement = document.createElement("div");
      qrReaderElement.id = uniqueId;
      container.appendChild(qrReaderElement);

      // Wait briefly to ensure DOM is updated
      setTimeout(() => {
        // Skip if component has unmounted or changed state
        if (uploadStep !== "scan" || !qrScannerContainerRef.current) return;

        // Verify the element exists
        const qrElement = document.getElementById(uniqueId);
        if (!qrElement) {
          console.error("QR reader element not found in DOM");
          return;
        }

        try {
          // Create the scanner using the unique ID
          scannerRef.current = new Html5QrcodeScanner(
            uniqueId,
            { fps: 10, qrbox: 250 },
            false
          );

          // Set flag before rendering to prevent duplicate initializations
          scannerInitializedRef.current = true;

          // Render the scanner
          scannerRef.current.render(onScanSuccess, onScanFailure);

          // Style the scanner buttons to match app styling after rendering
          setTimeout(() => {
            // Find and update the camera permission button
            const cameraPermissionButton = document.getElementById(
              `html5-qrcode-button-camera-permission`
            );
            if (cameraPermissionButton) {
              cameraPermissionButton.className = "btn btn-light";
              // Add camera icon
              if (!cameraPermissionButton.innerHTML.includes("bi-camera")) {
                cameraPermissionButton.innerHTML =
                  '<i class="bi bi-camera me-2"></i>' +
                  cameraPermissionButton.innerHTML;
              }
            }

            // Find and update the file selection button
            const fileSelectionButton = document.getElementById(
              `html5-qrcode-button-file-selection`
            );
            if (fileSelectionButton) {
              fileSelectionButton.className = "btn btn-light ms-2";
              // Add image icon
              if (!fileSelectionButton.innerHTML.includes("bi-image")) {
                fileSelectionButton.innerHTML =
                  '<i class="bi bi-image me-2"></i>' +
                  fileSelectionButton.innerHTML;
              }
            }
          }, 500); // Small delay to ensure the scanner has rendered
        } catch (err) {
          console.error("Error initializing QR scanner:", err);
          setError(
            "Could not initialize camera. Please check camera permissions."
          );
        }
      }, 100);
    }

    // Clean up function
    return () => {
      if (uploadStep !== "scan") {
        cleanupScanner();
      }
    };
  }, [uploadStep, cleanupScanner, onScanSuccess, onScanFailure]);

  // Always cleanup scanner when component unmounts
  useEffect(() => {
    return cleanupScanner;
  }, [cleanupScanner]);

  useEffect(() => {
    if (scannedCode) {
      fetchEventDetails(scannedCode);
    }
  }, [scannedCode]);

  const fetchEventDetails = async (code) => {
    try {
      const response = await eventsApi.getByQrCode(code);
      setEvent(response.data);
    } catch (err) {
      setError("Failed to find event. The QR code may be invalid or expired.");
      console.error("Error fetching event:", err);
    }
  };

  const validateImage = (file) => {
    return new Promise((resolve) => {
      if (!file.type.match("image.*")) {
        resolve({ file, valid: false, message: "Not a valid image file." });
        return;
      }

      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ file, valid: true });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          file,
          valid: false,
          message: "File appears to be corrupted or not a valid image.",
        });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const processFiles = useCallback(async (files) => {
    setFileErrors([]);

    const validationPromises = files.map(validateImage);
    const validationResults = await Promise.all(validationPromises);

    const invalidFiles = validationResults.filter((result) => !result.valid);
    const validFiles = validationResults
      .filter((result) => result.valid)
      .map((result) => result.file);

    if (invalidFiles.length > 0) {
      setFileErrors((prev) => [
        ...prev,
        ...invalidFiles.map((invalidFile) => ({
          name: invalidFile.file.name,
          message: invalidFile.message,
        })),
      ]);
    }

    const newFiles = validFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((rejected) => ({
          name: rejected.file.name,
          message: rejected.errors.map((e) => e.message).join(", "),
        }));
        setFileErrors(errors);
      }

      await processFiles(acceptedFiles);
    },
    [processFiles]
  );

  const handleFileInputChange = useCallback(
    async (e) => {
      const fileList = e.target.files;
      if (fileList?.length > 0) {
        const files = Array.from(fileList);
        await processFiles(files);
      }
    },
    [processFiles]
  );

  const handleChoosePhotosClick = useCallback(() => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.click();
    }
  }, [uploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    onDrop,
    multiple: true,
    noClick: true,
    noDrag: uploading,
    noKeyboard: uploading,
  });

  const removeFile = useCallback((fileToRemove) => {
    setSelectedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError("Please select at least one photo to upload");
      return;
    }

    // Only validate user input if they're not authenticated
    if (!isAuthenticated && !userData.trim()) {
      setUserDataError("Name cannot be empty or whitespace only");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setUploadedCount(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("title", file.name);
      formData.append("uploadedBy", userData.trim() || "Anonymous");

      try {
        await photosApi.uploadByQrCode(scannedCode, formData);
        setUploadedCount((prev) => prev + 1);
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (err) {
        console.error(`Error uploading file ${file.name}:`, err);
      }
    }

    setUploading(false);
    setSuccess(true);
    setSelectedFiles([]);
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  const thumbs = selectedFiles.map((file) => (
    <div
      className="col-4 col-md-3 mb-3"
      key={`${file.name}-${file.lastModified}`}
    >
      <div className="card h-100">
        <img
          src={file.preview}
          className="card-img-top"
          alt={file.name}
          style={{ height: "160px", objectFit: "cover" }}
        />
        <div className="card-body p-2">
          <p className="card-text small text-truncate">{file.name}</p>
          <button
            type="button"
            className="btn btn-sm btn-light w-100"
            onClick={() => removeFile(file)}
          >
            <i className="bi bi-trash me-1"></i>
            Remove
          </button>
        </div>
      </div>
    </div>
  ));

  if (uploadStep === "scan") {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h2 className="mb-0">Scan QR Code</h2>
              </div>
              <div className="card-body text-center">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <p className="card-text mb-4">
                  Position the event QR code in front of your camera to upload
                  photos.
                </p>
                <div className="mb-4">
                  <div
                    ref={qrScannerContainerRef}
                    className="mx-auto"
                    style={{ maxWidth: "500px", overflow: "hidden" }}
                  >
                    {/* QR reader will be created dynamically here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Upload Photos</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {fileErrors.length > 0 && (
                <div className="alert alert-warning" role="alert">
                  <h5>Some files could not be added:</h5>
                  <ul className="mb-0">
                    {fileErrors.map((fileError, index) => (
                      <li key={index}>
                        {fileError.name}: {fileError.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  Successfully uploaded {uploadedCount} photos!
                </div>
              )}

              {event ? (
                <>
                  <div className="mb-4">
                    <h4>Event: {event.title}</h4>
                    <p className="text-muted">
                      Date: {new Date(event.date).toLocaleDateString()}
                      <br />
                      Location: {event.location || "No location specified"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="userData" className="form-label">
                        {isAuthenticated ? "Your Name" : "Your Name (optional)"}
                      </label>
                      <div className="input-group">
                        {isAuthenticated && (
                          <span className="input-group-text">
                            <i className="bi bi-person-check"></i>
                          </span>
                        )}
                        <input
                          type="text"
                          className={`form-control ${
                            isAuthenticated ? "bg-light" : ""
                          }`}
                          id="userData"
                          value={userData}
                          onChange={(e) => {
                            setUserData(e.target.value);
                            setUserDataError("");
                          }}
                          placeholder="Anonymous"
                          readOnly={isAuthenticated}
                        />
                      </div>
                      {isAuthenticated && (
                        <small className="text-muted">
                          Using your account name
                        </small>
                      )}
                      {userDataError && (
                        <div className="text-danger mt-1">{userDataError}</div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleFileInputChange}
                      disabled={uploading}
                    />

                    <div className="mb-4">
                      <div
                        {...getRootProps({
                          className: `dropzone border-2 border-dashed rounded p-5 text-center ${
                            isDragActive
                              ? "bg-light border-primary shadow-sm"
                              : "border-secondary"
                          } ${uploading ? "disabled opacity-50" : ""}`,
                        })}
                        style={{
                          backgroundColor: isDragActive ? "#f8f9fa" : "#f8f8f8",
                          minHeight: "200px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <input {...getInputProps()} />
                        <div
                          className={`dropzone-content ${
                            isDragActive ? "py-4" : ""
                          }`}
                        >
                          {isDragActive ? (
                            <>
                              <i className="bi bi-cloud-arrow-down fs-1 text-primary mb-2"></i>
                              <p className="fs-5 fw-bold">
                                Drop the images here ...
                              </p>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-images fs-1 text-primary mb-3"></i>
                              <h5>
                                {uploading
                                  ? "Please wait until upload completes"
                                  : "Drag & drop photos here"}
                              </h5>
                              <p className="text-muted mb-3">
                                Accepts JPG, PNG, GIF files
                              </p>
                              <button
                                type="button"
                                className="btn btn-light mt-2"
                                onClick={handleChoosePhotosClick}
                                disabled={uploading}
                              >
                                <i className="bi bi-images me-2"></i>
                                Choose Photos
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <>
                        <h5>Selected Photos ({selectedFiles.length})</h5>
                        <div className="row">{thumbs}</div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={handleChoosePhotosClick}
                            disabled={uploading}
                          >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add More Photos
                          </button>

                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading || selectedFiles.length === 0}
                          >
                            {uploading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                ></span>
                                Uploading... ({uploadProgress}%)
                              </>
                            ) : (
                              <>
                                <i className="bi bi-cloud-upload me-2"></i>
                                Upload {selectedFiles.length} Photos
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading event details...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
