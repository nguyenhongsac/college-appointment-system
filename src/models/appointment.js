const mongoose = require("mongoose");

const appointmentSchema  = new mongoose.Schema({
    studentId:          {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    professorId:        {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    slotId:             {type: mongoose.Schema.Types.ObjectId, ref: "AvailabilitySlot", required: true},
    notes:              String,
    status:             {type: String, enum: ["pending", "cancelled", "accepted", "expired"], default: "pending"}
}, {timestamps: true});

let Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;