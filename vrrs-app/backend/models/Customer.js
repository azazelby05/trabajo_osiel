import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    customer_id: { type: Number, required: true, unique: true },
    full_name: { type: String, required: true },
    national_id: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  { collection: "customers" }
);

export default mongoose.model("Customer", schema);
