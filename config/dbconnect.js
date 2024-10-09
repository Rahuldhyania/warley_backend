const mongoose = require("mongoose");
require('dotenv').config();

const dbConnect = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(`${process.env.MONGODB_URI}`, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}
module.exports = dbConnect;
