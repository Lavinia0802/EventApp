import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // For MongoDB storage option
  imageData: {
    type: String, // Base64 encoded image data
  },
  uploadedBy: {
    type: String, // Anonymous or user identifier
    default: "Anonymous",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;
