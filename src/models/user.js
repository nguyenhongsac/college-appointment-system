const mongoose = require("mongoose");
const brypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username:   {type: String, required: true, unique: true},
    password:   {type: String, required: true}, // password is hashed
    fullname:   String,
    role:       String, // student or professor
    phone:      String,
    age:        Number
}, {timestamps: true});

let User = mongoose.model("User", userSchema);
module.exports = User;