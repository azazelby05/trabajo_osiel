import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", schema);
