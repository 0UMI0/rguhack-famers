const path = require("path");
require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.API_KEY; // ✅ use .env
const allowedModes = new Set(["driving", "walking", "bicycling", "transit"]);

app.get("/directions", async (req, res) => {
  try {
    const origin = (req.query.origin || "").trim();
    const destination = (req.query.destination || "").trim();
    const mode = allowedModes.has(req.query.mode) ? req.query.mode : "driving";

    if (!origin || !destination) {
      return res.status(400).json({ error: "origin and destination are required" });
    }

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      { params: { origin, destination, mode, key: 'AIzaSyDVZv1Oa7o5wgWUiDP5wUZA6Nd0PiAL6Vg' } }
    );

    const data = response.data;
    if (data.status !== "OK" || !data.routes?.length) {
      return res.status(400).json({
        error: "No route found",
        status: data.status,
        googleError: data.error_message,
      });
    }

    const leg = data.routes[0].legs[0];
    res.json({
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));