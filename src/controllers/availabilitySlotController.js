const AvailabilitySlot = require("../models/availabilitySlot");
const mongoose = require("mongoose");

/*
    View availability slot
    GET api/availability/:professorId
*/
const viewSlot = async function(req, res) {
    try {
        // Get slot list of professor based on _id
        const professorId = req.params.professorId;
        
        // Check valid id type object of mongodb
        if (!mongoose.Types.ObjectId.isValid(professorId)) {
            return res.status(400).json({ success: false, message: 'Invalid Professor ID format.' });
        }

        const slots = await AvailabilitySlot.find({ professorId: professorId, isAvailable: true, isBooked: false }).sort({ startTime: 1 });
        
        if (!slots) {
            return res.status(404).json({ success: false, message: "Available slots not found" });
        }

        console.log("[INFO] Someone views availability slot");
        
        res.status(200).json({ 
            success: true, 
            count: slots.length, 
            slots 
        });
        
    } catch (err) {
        console.log("[ERR] View availability slot: ", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

/*
    Create new slot
    POST api/availability
    body: { startTime, endTime }
*/
const createSlot = async function(req, res) {
    // Get slot data
    const { startTime, endTime } = req.body;
    const professorId = req.user._id;

    // Check valid time
    if (!startTime || !endTime) {
        return res.status(400).json({ success: false, message: "Start time and end time are required" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate == "Invalid Date" || endDate == "Invalid Date") {
        return res.status(400).json({ success: false, message: "Wrong time format" });
    }

    if (startDate >= endDate) {
        return res.status(400).json({ success: false, message: "Start time must be before end time" });
    }

    try {
        // Check overlapping slot, newStart < oldEnd && newEnd > oldStart
        const overlappingSlot = await AvailabilitySlot.find({
            professorId: professorId,
            startTime:  { $lt: endDate },
            endTime:    { $gt: startDate }
        }).exec();

        if (overlappingSlot.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Overlapping with old availability slots",
                overlappingSlot
            });
        }

        // Create new
        const newSlot = await AvailabilitySlot.create({
            professorId: professorId,
            startTime: startTime,
            endTime: endTime,
            isAvailable: true,
            isBooked: false
        });
        console.log("[INFO] A new available slot is created");

        res.status(201).json({ 
            success: true, 
            message: "Available slot created successfully", 
            newSlot 
        });

    } catch (err) {
        console.log("[ERR] Create availability slot: ", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

/*
    Update slot
    PUT api/availability/:slotId
    body { startTime, endTime, isAvailable, isBooked }
*/
const updateSlot = async function(req, res) {
    const slotId = req.params.slotId;
    const { startTime, endTime, isAvailable, isBooked} = req.body;

    // Check valid data before update
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
        return res.status(400).json( {success: false, message: "Invalid available slot id" });
    }
    
    if (!startTime || !endTime || isAvailable === undefined || isBooked === undefined) {
        return res.status(400).json({ success: false, message: "Slot information is required" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
        return res.status(400).json({ 
            success: false, 
            message: "Start time must be before end time" 
        });
    }

    try {
        const updatedSlot = await AvailabilitySlot.findByIdAndUpdate({ _id: slotId }, {
            startTime: startDate,
            endTime: endDate,
            isAvailable: isAvailable,
            isBooked: isBooked
        }, { new: true, runValidators: true });

        if (!updatedSlot) {
            return res.status(404).json({ success: false, message: "Available slot not found" });
        }

        console.log("[INFO] Someone updates an available slot");

        res.status(200).json({ 
            success: true, 
            message: "Available slot updated successfully", 
            updatedSlot 
        });

    } catch (err) {
        console.log("[ERR] Update availability slot: ", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/*
    Delete slot
    DELETE api/availability/:slotId
*/
const deleteSlot = async function(req, res) {
    const slotId = req.params.slotId;

    if (!mongoose.Types.ObjectId.isValid(slotId)) {
        return res.status(400).json( {success: false, message: "Invalid available slot id" });
    }

    try {
        const deletedSlot = await AvailabilitySlot.findByIdAndDelete({ _id: slotId });
        if (!deletedSlot) {
            return res.status(404).json({ success: false, message: "Available slot not found" });
        }

        console.log("[INFO] A available slot was deleted");

        res.status(200).json({ 
            success: true, 
            message: "Available slot updated successfully", 
            deletedSlot 
        });

    } catch (err) {
        console.log("[ERR] Delete availability slot: ", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    viewSlot,
    createSlot,
    updateSlot,
    deleteSlot
}