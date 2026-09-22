import mongoose from "mongoose";
import { USER_ROLES } from "../constants/statuses.js";

const schema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    user_name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "staff" },
  },
  { collection: "users" }
);

export default mongoose.model("User", schema);
