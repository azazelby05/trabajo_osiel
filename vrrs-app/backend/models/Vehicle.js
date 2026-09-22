import mongoose from "mongoose";
import { VEHICLE_STATUSES } from "../constants/statuses.js";

const schema = new mongoose.Schema(
  {
    vehicle_id: { type: Number, required: true, unique: true },
    plate_number: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vehicle_type: { type: String, required: true },
    purchase_price: { type: Number, required: true },
    status: { type: String, enum: VEHICLE_STATUSES, default: "Available" },
  },
  { collection: "vehicles" }
);

export default mongoose.model("Vehicle", schema);
