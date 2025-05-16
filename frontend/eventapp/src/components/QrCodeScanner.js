import { useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QrCodeScanner = ({ onScanSuccess, theme, onError }) => {
  const scannerRef = useRef(null);
  const qrScannerContainerRef = useRef(null);
  const scannerInitializedRef = useRef(false);
  const cameraActivatedRef = useRef(false);
  const visibilityChangeRef = useRef(false);
  // Cleanup function for scanner
  const cleanupScanner = useCallback(() => {
    try {
      // Safely clean up the scanner if it exists
      if (scannerRef.current) {
        try {
          // Then clear the scanner UI
          scannerRef.current.clear();
        } catch (err) {
          console.debug("Error clearing scanner, ignoring:", err);
        }
        scannerRef.current = null;
      }

      // Reset initialization flag even if clear() fails
      scannerInitializedRef.current = false;

      // Also remove all qr-reader elements from the DOM
      document.querySelectorAll('[id^="qr-reader"]').forEach((el) => {
        if (el && el.parentNode) {
          try {
            el.parentNode.removeChild(el);
          } catch (err) {
            console.debug("Error removing QR reader element, ignoring:", err);
          }
        }
      });
    } catch (error) {
      // Catch all errors and just log them - we never want cleanup to throw
      console.debug("Non-critical error during scanner cleanup:", error);
    }
  }, []);

  const onScanFailure = useCallback((error) => {
    if (error.includes("No MultiFormat Readers were able to detect the code")) {
      // Ignore this error, no QR code detected
      return;
    }

    console.debug(`QR scan error: ${error}`);

    if (error.includes("Failed to execute 'getImageData'")) {
      // Refresh the page to reset the scanner
      console.debug("Refreshing page due to camera permission error");
      window.location.reload();
    }
  }, []);

  // Initialize the scanner
  useEffect(() => {
    if (!scannerInitializedRef.current && qrScannerContainerRef.current) {
      console.debug(
        "Initializing QR scanner",
        cameraActivatedRef.current
          ? "(after visibility change)"
          : "(first time)"
      );

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
        if (!qrScannerContainerRef.current) {
          console.debug(
            "Component state changed before scanner initialization"
          );
          return;
        }

        // Verify the element exists
        const qrElement = document.getElementById(uniqueId);
        if (!qrElement) {
          console.debug("QR reader element not found in DOM");
          return;
        }

        try {
          // Create the scanner using the unique ID
          try {
            console.debug("Creating new Html5QrcodeScanner instance");

            // Reset scanner state
            scannerRef.current = null;
            scannerInitializedRef.current = false;

            // Create new instance
            scannerRef.current = new Html5QrcodeScanner(
              uniqueId,
              { fps: 10, qrbox: 250 },
              false
            );

            // Set flag before rendering to prevent duplicate initializations
            scannerInitializedRef.current = true;

            // Render the scanner with error handling
            try {
              // Set camera activated flag
              const cameraPermissionButton = document.getElementById(
                `html5-qrcode-button-camera-permission`
              );

              if (cameraPermissionButton) {
                // Add listener to track when camera permission is requested
                cameraPermissionButton.addEventListener("click", () => {
                  console.debug("Camera permission requested");
                  cameraActivatedRef.current = true;
                });
              }

              try {
                // Call render method
                scannerRef.current.render(onScanSuccess, onScanFailure);
                console.debug("QR scanner render called successfully");
              } catch (renderErr) {
                console.debug("Error in QR scanner render:", renderErr);
                // Don't set error state, silently ignore
              }

              // Apply additional styling to QR scanner internal elements
              setTimeout(() => {
                try {
                  // Style the video element
                  const videoElement =
                    document.querySelector("#qr-reader video");
                  if (videoElement) {
                    videoElement.style.borderRadius = "6px";
                    videoElement.style.boxShadow =
                      theme === "dark"
                        ? "0 2px 4px rgba(255, 255, 255, 0.1)"
                        : "0 2px 4px rgba(0, 0, 0, 0.1)";
                  }

                  // Style the form element
                  const formElement = document.querySelector("#qr-reader form");
                  if (formElement) {
                    formElement.style.marginTop = "10px";
                    formElement.style.display = "flex";
                    formElement.style.flexDirection = "column";
                    formElement.style.alignItems = "center";
                    formElement.style.gap = "10px";
                  }

                  // Style the section element
                  const sectionElement =
                    document.querySelector("#qr-reader section");
                  if (sectionElement) {
                    sectionElement.style.textAlign = "center";
                    sectionElement.style.marginTop = "10px";
                  }

                  // Style the header message
                  const headerElement = document.querySelector(
                    "#qr-reader__header_message"
                  );
                  if (headerElement) {
                    headerElement.style.color =
                      theme === "dark" ? "#a0aec0" : "#6c757d";
                    headerElement.style.fontSize = "14px";
                    headerElement.style.marginBottom = "10px";
                  }

                  // Apply dark theme to QR reader container if needed
                  const qrReader = document.querySelector("#qr-reader");
                  if (qrReader && theme === "dark") {
                    qrReader.style.background = "#2d3748";
                    qrReader.style.color = "#e2e8f0";

                    // Find and style text elements
                    const textElements = qrReader.querySelectorAll(
                      "span, div:not([class*='scan-region']), p"
                    );
                    textElements.forEach((element) => {
                      // Don't style elements that need to maintain specific styling
                      if (
                        element.id &&
                        (element.id.includes("dashboard") ||
                          element.id.includes("region") ||
                          element.id.includes("scan"))
                      ) {
                        return;
                      }
                      element.style.color = "#e2e8f0";
                    });
                  }
                } catch (error) {
                  console.debug("Non-critical element styling error:", error);
                }
              }, 700); // Give a little more time for video element to be created
            } catch (renderError) {
              console.debug("QR scanner render failed, ignoring:", renderError);
              // Don't set error state here, just let it fail silently
            }

            // Style the scanner buttons to match app styling after rendering
            setTimeout(() => {
              try {
                // Find and update the camera permission button
                const cameraPermissionButton = document.getElementById(
                  `html5-qrcode-button-camera-permission`
                );
                if (cameraPermissionButton) {
                  cameraPermissionButton.className =
                    theme === "dark" ? "btn btn-dark" : "btn btn-light";
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
                  fileSelectionButton.className =
                    theme === "dark"
                      ? "btn btn-dark ms-2"
                      : "btn btn-light ms-2";
                  // Add image icon
                  if (!fileSelectionButton.innerHTML.includes("bi-image")) {
                    fileSelectionButton.innerHTML =
                      '<i class="bi bi-image me-2"></i>' +
                      fileSelectionButton.innerHTML;
                  }
                }

                // Find and update the start scanning button
                const startScanButton = document.getElementById(
                  `html5-qrcode-button-camera-start`
                );
                if (startScanButton) {
                  startScanButton.className = "btn btn-primary mt-2";
                  // Add play icon
                  if (!startScanButton.innerHTML.includes("bi-play")) {
                    startScanButton.innerHTML =
                      '<i class="bi bi-play-fill me-2"></i>' +
                      startScanButton.innerHTML;
                  }
                }

                // Find and update the stop scanning button
                const stopScanButton = document.getElementById(
                  `html5-qrcode-button-camera-stop`
                );
                if (stopScanButton) {
                  stopScanButton.className = "btn btn-danger mt-2";
                  // Add stop icon
                  if (!stopScanButton.innerHTML.includes("bi-stop")) {
                    stopScanButton.innerHTML =
                      '<i class="bi bi-stop-fill me-2"></i>' +
                      stopScanButton.innerHTML;
                  }
                }
              } catch (styleError) {
                console.debug(
                  "Non-critical style error in QR scanner:",
                  styleError
                );
                // Styling errors are non-critical, don't set error state
              }
            }, 500); // Small delay to ensure the scanner has rendered
          } catch (initError) {
            console.error("Error initializing QR scanner:", initError);
            if (onError) {
              onError(
                "Could not initialize camera. Please check camera permissions."
              );
            }
          }
        } catch (outerError) {
          console.debug("Outer QR scanner error, ignoring:", outerError);
          // Silently ignore outer errors
        }
      }, 100);
    }
  }, [cleanupScanner, onScanSuccess, onScanFailure, theme, onError]);
  // Always cleanup scanner when component unmounts
  useEffect(() => {
    // On component mount, reset visibility change flag
    visibilityChangeRef.current = false;

    // Create an unmounting flag reference to track unmounting state
    const isUnmountingRef = { current: false };

    return () => {
      console.debug("Component unmounting, cleaning up scanner");

      // Set unmounting flag to true
      isUnmountingRef.current = true;

      // Use a small timeout to avoid race conditions with ongoing transitions
      const timeoutId = setTimeout(() => {
        // Only proceed if we haven't already cleaned up
        if (scannerRef.current) {
          cleanupScanner();
        }

        // Reset all state related to scanner
        cameraActivatedRef.current = false;
        visibilityChangeRef.current = false;
      }, 50);

      // In case the timeout is too long, also try immediate cleanup
      // but catch and ignore transition errors
      try {
        if (scannerRef.current && !scannerRef.current._fullyCleanedUp) {
          scannerRef.current._fullyCleanedUp = true;
          cleanupScanner();
        }
      } catch (err) {
        console.debug("Immediate cleanup failed, will retry in timeout:", err);
      }

      // Ensure the timeout is cleared if React somehow re-renders (although this shouldn't happen during unmount)
      return () => clearTimeout(timeoutId);
    };
  }, [cleanupScanner]);

  // Function to continuously check for and style scanner buttons as they appear in the DOM
  const applyScannerButtonStyles = useCallback(() => {
    let stylingInterval;

    const applyStyles = () => {
      try {
        // Start scanning button
        const startButton = document.getElementById(
          "html5-qrcode-button-camera-start"
        );
        if (startButton && !startButton.classList.contains("styled-btn")) {
          startButton.className = "btn btn-primary mt-2 styled-btn";
          if (!startButton.innerHTML.includes("bi-play")) {
            startButton.innerHTML =
              '<i class="bi bi-play-fill me-2"></i>' + startButton.innerHTML;
          }

          // Add theme-specific border for better visibility in dark mode
          if (theme === "dark") {
            startButton.style.borderColor = "#4a5568";
          }
        }

        // Stop scanning button
        const stopButton = document.getElementById(
          "html5-qrcode-button-camera-stop"
        );
        if (stopButton && !stopButton.classList.contains("styled-btn")) {
          stopButton.className = "btn btn-danger mt-2 styled-btn";
          if (!stopButton.innerHTML.includes("bi-stop")) {
            stopButton.innerHTML =
              '<i class="bi bi-stop-fill me-2"></i>' + stopButton.innerHTML;
          }

          // Add theme-specific border for better visibility in dark mode
          if (theme === "dark") {
            stopButton.style.borderColor = "#4a5568";
          }
        }

        // Apply theme-specific styling to the QR reader
        const qrReader = document.getElementById("qr-reader");
        if (qrReader) {
          if (theme === "dark") {
            qrReader.style.background = "#2d3748";
            qrReader.style.color = "#e2e8f0";

            // Find and style all text elements inside QR reader
            const textElements = qrReader.querySelectorAll(
              "span, div, p, h1, h2, h3, h4, h5, h6"
            );
            textElements.forEach((element) => {
              // Skip elements with ID containing specific strings that need different styling
              if (
                element.id &&
                (element.id.includes("dashboard") ||
                  element.id.includes("header"))
              ) {
                return;
              }
              element.style.color = "#e2e8f0";
            });
          } else {
            // Light theme
            qrReader.style.background = "#ffffff";
            qrReader.style.color = "inherit";
          }
        }
      } catch (error) {
        console.debug("Non-critical button styling error:", error);
      }
    };

    // Apply styles immediately and set up interval to check periodically
    applyStyles();
    stylingInterval = setInterval(applyStyles, 500);

    // Return cleanup function
    return () => {
      clearInterval(stylingInterval);
    };
  }, [theme]);

  // Apply dynamic button styling
  useEffect(() => {
    const cleanupStyler = applyScannerButtonStyles();
    return () => {
      if (cleanupStyler) cleanupStyler();
    };
  }, [applyScannerButtonStyles]);

  return (
    <div
      ref={qrScannerContainerRef}
      className="mx-auto qr-scanner-container"
      style={{
        maxWidth: "500px",
        overflow: "hidden",
        borderRadius: "8px",
        boxShadow:
          theme === "dark"
            ? "0 4px 6px rgba(0, 0, 0, 0.4)"
            : "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        background: theme === "dark" ? "#2d3748" : "#f8f9fa",
        color: theme === "dark" ? "#e2e8f0" : "inherit",
      }}
    >
      {/* QR reader will be created dynamically here */}
    </div>
  );
};

export default QrCodeScanner;
