const express = require("express");
const { protect, authRole } = require("../middleware/authMiddleware");
const appointmentController = require("../controllers/appointmentController");

const router = express.Router();

router.get("/", protect, appointmentController.viewAppointment);
router.post("/:professorId", protect, authRole("student"), appointmentController.bookAppointment);
router.put("/:appointmentId", protect, authRole("professor"), appointmentController.updateAppointment);

module.exports = router;