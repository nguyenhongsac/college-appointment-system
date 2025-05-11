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
            // console.log("[JWT] ", decoded);

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

// Verify role
const authRole = function(...roles) {
    return function(req, res, next) {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You can not access this" });
        }
        
        next();
    }
};

module.exports = { protect, authRole };