const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const mongoServer = new MongoMemoryServer();

exports.dbConnect = async function() {
    const uri = await mongoServer.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    };

    await mongoose.connect(uri, mongooseOpts);
};

exports.dbDisconnect = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
}