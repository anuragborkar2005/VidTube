import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { DB_URL } from "../constants.js";

const connectDB = async () => {
  try {
    const res = await mongoose.connect(DB_URL);
    console.log("Database Connected Successfully " + res.connection.host);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw new Error("Database connection failed");
    process.exit(1);
  }
};

export default connectDB;
