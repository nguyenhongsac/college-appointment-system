const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Connect mongo atlas
const mongoose = require("./config/db");

// First api
app.get("/", function(req, res) {
    res.send("Hello");
});

/*
    Authentication api
*/
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

/*
    Availability slot api
*/
const availabilitySlotRoutes = require("./routes/availabilitySlotRoutes");
app.use("/api/availability", availabilitySlotRoutes);

/*
    Appointment api
*/
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointment", appointmentRoutes);

module.exports = app;