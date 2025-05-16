import express from "express";
import fileUpload from "express-fileupload";
import Photo from "../models/Photo.js";
import Event from "../models/Event.js";
import path from "path";
import FileType from "file-type";

const router = express.Router();

// Helper function to validate image files
const validateImageFile = async (file) => {
  // List of allowed MIME types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

  // Detect the file type from the buffer
  try {
    const fileTypeResult = await FileType.fromBuffer(file.data);

    // If file type can't be detected, it's not a valid image
    if (!fileTypeResult) {
      return { valid: false, message: "Could not determine file type" };
    }

    // Check if detected MIME type is in allowed list
    if (!allowedMimeTypes.includes(fileTypeResult.mime)) {
      return {
        valid: false,
        message: `File type ${fileTypeResult.mime} is not allowed`,
      };
    }

    // Check if the detected file extension matches the claimed extension
    const claimedExtension = path.extname(file.name).toLowerCase().substring(1);
    if (
      fileTypeResult.ext !== claimedExtension &&
      !(fileTypeResult.ext === "jpg" && claimedExtension === "jpeg")
    ) {
      return {
        valid: false,
        message: `File extension mismatch. Claimed: ${claimedExtension}, Actual: ${fileTypeResult.ext}`,
      };
    }

    // All checks passed
    return { valid: true };
  } catch (error) {
    return { valid: false, message: "Error validating file: " + error.message };
  }
};

// Configure file upload middleware
router.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    createParentPath: true,
  })
);

// Get photos by event ID
router.get("/event/:eventId", async (req, res) => {
  try {
    const photos = await Photo.find({ eventId: req.params.eventId });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload photo for a specific event by QR code
router.post("/upload/:qrCode", async (req, res) => {
  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const uploadedPhoto = req.files.photo;

    // Validate that the uploaded file is actually an image
    const validationResult = await validateImageFile(uploadedPhoto);
    if (!validationResult.valid) {
      return res.status(400).json({
        message: "Invalid image file",
        error: validationResult.message,
      });
    }

    // Find event by QR code
    const event = await Event.findOne({ qrCodeData: req.params.qrCode });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Store photo in MongoDB as Base64
    const photoData = uploadedPhoto.data.toString("base64");

    // Create new photo record
    const photo = new Photo({
      eventId: event._id,
      title: req.body.title || "Untitled",
      description: req.body.description || "",
      imageData: photoData,
      uploadedBy: req.body.uploadedBy || "Anonymous",
    });

    const savedPhoto = await photo.save();

    // Update event with photo reference
    event.photos.push(savedPhoto._id);
    await event.save();

    res.status(201).json({
      message: "Photo uploaded successfully",
      photo: savedPhoto,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single photo by ID
router.get("/:id", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
