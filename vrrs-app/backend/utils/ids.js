import Counter from "../models/Counter.js";

export const nextId = async (name) => {
  const counter = await Counter.findOneAndUpdate({ name }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq;
};
