import Customer from "../models/Customer.js";
import ReservationRental from "../models/ReservationRental.js";
import { nextId } from "../utils/ids.js";

const strip = (d) => {
  const o = d.toObject ? d.toObject() : d;
  const { _id, __v, ...r } = o;
  return r;
};

export const create = async (req, res) => {
  try {
    const { fullName, nationalId, phone, email, address } = req.body;
    if (!fullName?.trim() || !nationalId?.trim() || !phone?.trim() || !email?.trim() || !address?.trim()) {
      return res.status(400).json({ message: "All customer fields are required." });
    }
    await Customer.create({
      customer_id: await nextId("customer_id"),
      full_name: fullName.trim(),
      national_id: nationalId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    });
    return res.status(201).json({ message: "Customer added successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "National ID already exists." });
    return res.status(500).json({ message: "Failed to add customer." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json((await Customer.find().sort({ customer_id: -1 }).lean()).map(strip));
  } catch {
    return res.status(500).json({ message: "Failed to fetch customers." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const re = new RegExp(q, "i");
    return res.json(
      (
        await Customer.find({
          $or: [{ full_name: re }, { national_id: re }, { phone: re }, { email: re }],
        })
          .sort({ customer_id: -1 })
          .lean()
      ).map(strip)
    );
  } catch {
    return res.status(500).json({ message: "Failed to search customers." });
  }
};

export const getById = async (req, res) => {
  try {
    const doc = await Customer.findOne({ customer_id: Number(req.params.id) }).lean();
    if (!doc) return res.status(404).json({ message: "Customer not found." });
    return res.json(strip(doc));
  } catch {
    return res.status(500).json({ message: "Failed to fetch customer." });
  }
};

export const update = async (req, res) => {
  try {
    const { fullName, nationalId, phone, email, address } = req.body;
    const doc = await Customer.findOneAndUpdate(
      { customer_id: Number(req.params.id) },
      {
        full_name: fullName?.trim(),
        national_id: nationalId?.trim(),
        phone: phone?.trim(),
        email: email?.trim(),
        address: address?.trim(),
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Customer not found." });
    return res.json({ message: "Customer updated successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "National ID already exists." });
    return res.status(500).json({ message: "Failed to update customer." });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (await ReservationRental.findOne({ customer_id: id })) {
      return res.status(409).json({ message: "Cannot delete: customer has reservations/rentals." });
    }
    const doc = await Customer.findOneAndDelete({ customer_id: id });
    if (!doc) return res.status(404).json({ message: "Customer not found." });
    return res.json({ message: "Customer deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete customer." });
  }
};
