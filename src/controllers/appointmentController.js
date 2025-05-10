const mongoose = require("mongoose");
const Appointment = require("../models/appointment");

/*
    Allow student/professor view their appointments
    GET api/appointment
*/
const viewAppointment = async function(req, res) {
    const userId = req.user._id;

    try {
        // Get appointments base on userId and populate for more details
        const appointments = await Appointment.find({
            $or: [
                { professorId: userId },
                { studentId: userId }
            ]
        }).populate([
            { path: "professorId", select: "fullname" },
            { path: "studentId", select: "fullname" },
            { path: "slotId", select: "startTime endTime" }
        ]);
        if (!appointments) {
            return res.status(404).json({ success: false, message: "Appointments not found" });
        }

        console.log("[INFO] Someone views appointments")

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch(err) {
        console.log("[ERR] View appointment: ", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

/*
    Allow student book an appointment with professor
    POST api/appointment/:professorId
    body {slotId, notes}
*/
const bookAppointment = async function(req, res) {
    const professorId = req.params.professorId;
    const { slotId, notes } = req.body;
    const studentId = req.user._id;

    // Check valid id before create
    if (!mongoose.Types.ObjectId.isValid(professorId)) {
        return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
        return res.status(400).json({ success: false, message: "Invalid slot id" });
    }

    try {
        const newAppointment = await Appointment.create({
            professorId: professorId,
            studentId: studentId,
            slotId: slotId,
            notes: notes.trim(),
            status: "pending"
        });

        console.log("[INFO] A new appointment was created");

        res.status(201).json({
            success: true,
            message: "A new appointment created successfully",
            newAppointment
        });

    } catch(err) {
        console.log("[ERR] Book appointment: ", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

/*
    Allow professors accept or cancel an appointment
    PUT api/appointment/:appointmentId
    body { notes, status }
*/
const updateAppointment = async function(req, res) {
    const appointmentId = req.params.appointmentId;
    const { notes, status } = req.body;

    // Check valid appointmentId, notes and status before updating
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }
    if (!notes) {
        return res.status(400).json({ success: false, message: "Missing notes" });
    }
    if (!status || !["pending", "cancelled", "accepted", "expired"].includes(status)) {
        return res.status(400).json( {success: false, message: "Invalid status" });
    }

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate({ _id: appointmentId }, {
            notes: notes,
            status: status
        }, { new: true, runValidators: true });

        if (!updatedAppointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        console.log("[INFO] Someone updates an appointment");

        res.status(200).json({
            success: true,
            message: "Update appointment successfully",
            updatedAppointment
        });

    } catch(err) {
        console.log("[ERR] Update appointment: ", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports= {
    viewAppointment,
    bookAppointment,
    updateAppointment
}