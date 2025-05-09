const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("[INFO] Connected to MongoDB."))
.catch((err) => console.log("[ERR] MongoDB connection error: ", err));

module.exports = mongoose;