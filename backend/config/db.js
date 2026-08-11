const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // 1. Try Primary MONGODB_URI from .env
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log("MongoDB connected successfully to Atlas!");
  } catch (error) {
    console.warn("MongoDB Atlas connection warning:", error.message);
    console.log("Attempting fallback to local MongoDB...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/iedc_selection", {
        serverSelectionTimeoutMS: 2000
      });
      console.log("Connected to local MongoDB (fallback)");
    } catch (localErr) {
      console.log("💡 Tip: In MongoDB Atlas -> Network Access -> Click Add IP Address -> Type 0.0.0.0/0 into the input box -> Click Confirm.");
    }
  }
};

module.exports = connectDB;
