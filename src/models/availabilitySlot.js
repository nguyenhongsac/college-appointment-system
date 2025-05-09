const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema({
    professorId:    {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    startTime:      {type: Date, required: true},
    endTime:        {type: Date, required: true},
    isAvailable:    {type: Boolean, default: true},
    isBooked:       {type: Boolean, default: false}
}, {timestamps: true});

let AvailabilitySlot = mongoose.model("AvailabilitySlot", availabilitySlotSchema);
module.exports = AvailabilitySlot;