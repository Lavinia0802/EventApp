import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import QRCode from "qrcode";
import Event from "../models/Event.js";
import crypto from "crypto";

const router = express.Router();

// Auth0 middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Get all events (protected route)
router.get("/", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const events = await Event.find({ createdBy: userId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event (protected route)
router.post("/", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    // Generate a unique identifier for the QR code
    const uniqueId = crypto.randomUUID();
    const qrCodeData = `${req.protocol}://${req.get(
      "host"
    )}/upload/${uniqueId}`;

    // Generate QR code
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Create new event
    const event = new Event({
      ...req.body,
      createdBy: userId,
      qrCodeData: uniqueId,
    });

    const savedEvent = await event.save();

    res.status(201).json({
      event: savedEvent,
      qrCode: qrCodeImage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get event by QR code data
router.get("/qr/:code", async (req, res) => {
  try {
    const event = await Event.findOne({ qrCodeData: req.params.code });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (protected route)
router.put("/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: userId,
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or unauthorized" });
    }

    Object.assign(event, req.body);
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event (protected route)
router.delete("/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: userId,
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or unauthorized" });
    }

    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
