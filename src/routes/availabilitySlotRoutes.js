const express = require("express");
const slotController = require("../controllers/availabilitySlotController");
const { protect, authRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:professorId", protect, slotController.viewSlot);
router.post("/", protect, authRole("professor"), slotController.createSlot);
router.put("/:slotId", protect, authRole("professor"), slotController.updateSlot);
router.delete("/:slotId", protect, authRole("professor"), slotController.deleteSlot);

module.exports = router;