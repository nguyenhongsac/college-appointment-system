const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

exports.dbConnect = async function() {
    mongoServer = await MongoMemoryServer.create({
        instance: {
            auth: false
        }
    });

    const uri = await mongoServer.getUri();

    //Disconnect with mongo atlas
    await mongoose.disconnect();
    await mongoose.connect(uri);
};

exports.dbDisconnect = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}