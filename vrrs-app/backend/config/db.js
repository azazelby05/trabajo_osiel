import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Counter from "../models/Counter.js";

dotenv.config();

const ADMIN_HASH = "$2b$10$aULsUjp9bb9lf5CZZyY.7./KhwsocVO0duyPlqu0Qnte75xHBdG5C";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/VRRS");
    console.log("Database Connected Successfully");
    if ((await User.countDocuments()) === 0) {
      await User.create({ user_id: 1, user_name: "admin", password: ADMIN_HASH, role: "admin" });
      await Counter.findOneAndUpdate({ name: "user_id" }, { seq: 1 }, { upsert: true });
    }
    for (const name of ["customer_id", "vehicle_id", "reservation_rental_id", "user_id"]) {
      await Counter.findOneAndUpdate(
        { name },
        { $setOnInsert: { seq: name === "user_id" ? 1 : 0 } },
        { upsert: true }
      );
    }
    return true;
  } catch (error) {
    console.log("Database Connection Failed");
    console.error(error.message);
    return false;
  }
};

export default mongoose;
