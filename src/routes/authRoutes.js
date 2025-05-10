const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", protect, registerUser);
router.post("/login", protect, loginUser);

module.exports = router;