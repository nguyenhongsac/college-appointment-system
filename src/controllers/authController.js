const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN  = process.env.JWT_EXPIRES_IN || "24h";

// Generate token
const generateToken = function(userId, role) {
    return jwt.sign({ userId, role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/*
    Register new user
    POST /api/auth/register
*/
const registerUser = async function(req, res) {
  try {

    const { username, password, fullname, role, phone, age } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Please provide username and password" });
    }

    // Check username already exists
    const userExists = await User.findOne({ username: username });
    if (userExists) {
        return res.status(400).json({ success: false, message: "Username already exists" });
    }

    // Modify role
    let userRole = role;
    if (!role || !["student", "professor"].includes(role)) {
        userRole = "student";
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    
    // Create user
    const user = await User.create({
        username: username,
        password: passwordHash,
        fullname: fullname,
        role: userRole,
        phone: phone || null,
        age: age || null
    });

    if (user) {
        const token = generateToken(user._id, user.role);

        console.log("[INFO] A new user has been registered.");

        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                role: user.role,
                phone: user.phone,
                age: user.age
            }
        });

    } else {
        return res.status(400).json({ success: false, message: "Cannot create user" });
    }

  } catch (err) {
    console.log("[ERR] Registration error: ", err);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  } 
};

/*
    Login user
    POST api/auth/login
*/
const loginUser = async function(req, res) {
    try {
        // Login with username and password
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please provide username and password" });
        }

        // Check username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: "Username not found" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Password missmatch" });
        }

        // Generate token for user
        const token = generateToken(user._id, user.role);

        console.log("[INFO] An user has been logined.");

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                role: user.role,
                phone: user.phone,
                age: user.age
            }
        });

    } catch (err) {
        console.log("[ERR] Login error: ", err);
        return res.status(500).json({ success: false, message: "Login error" });
    }
}

module.exports = {
    registerUser,
    loginUser
}