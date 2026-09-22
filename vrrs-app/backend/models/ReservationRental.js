import mongoose from "mongoose";
import { RESERVATION_STATUSES, RENTAL_STATUSES } from "../constants/statuses.js";

const schema = new mongoose.Schema(
  {
    reservation_rental_id: { type: Number, required: true, unique: true },
    reservation_date: { type: Date },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    reservation_status: { type: String, enum: RESERVATION_STATUSES, default: "Pending" },
    rental_date: { type: Date },
    return_date: { type: Date },
    rental_fee: { type: Number, default: 0 },
    rental_status: { type: String, enum: RENTAL_STATUSES, default: "Not Started" },
    customer_id: { type: Number, required: true },
    vehicle_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
  },
  { collection: "reservation_rentals" }
);

export default mongoose.model("ReservationRental", schema);
