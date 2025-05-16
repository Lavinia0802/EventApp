import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { eventsApi, photosApi } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import QrCodeScanner from "../components/QrCodeScanner";

const PhotoUpload = () => {
  const { qrCode } = useParams();
  const fileInputRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

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

  // Define scan success handler
  const handleScanSuccess = (decodedText) => {
    const qrCodeRegex = /\/upload\/([^/]+)$/;
    const match = decodedText.match(qrCodeRegex);

    if (match && match[1]) {
      setScannedCode(match[1]);
      setUploadStep("upload");
    } else {
      setError("Invalid QR code format. Please scan a valid event QR code.");
    }
  };
  const handleScanError = (errorMessage) => {
    setError(errorMessage);
  };

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
                )}{" "}
                <p className="card-text mb-4">
                  Position the event QR code in front of your camera to upload
                  photos.
                </p>
                <div className="mb-4">
                  <QrCodeScanner
                    onScanSuccess={handleScanSuccess}
                    onError={handleScanError}
                    theme={theme}
                  />
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
                  </form>{" "}
                </>
              ) : error ? (
                <></>
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
