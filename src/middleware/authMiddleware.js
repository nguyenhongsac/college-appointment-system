const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET;

// Verify JWT token and add user to req
const protect = async function (req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user
            req.user = await User.findById(decoded.userId).select("-password");

            if (!req.user) {
                return res.status(401).json({ error: "User not found" });
            }

            next();
        } catch (err) {
            console.log("[ERR] Token verification error: ", err);
            return res.status(401).json({ error: "Authorized error" });
        }
    }

    if (!token) {
        return res.status(401).json({ error: "No token" });
    }
}

module.exports = protect;