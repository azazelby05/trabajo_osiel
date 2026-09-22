import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ReservationRental from "../models/ReservationRental.js";
import { USER_ROLES } from "../constants/statuses.js";
import { nextId } from "../utils/ids.js";

const strip = (d) => {
  const o = d.toObject ? d.toObject() : d;
  const { _id, __v, password, ...r } = o;
  return r;
};

export const create = async (req, res) => {
  try {
    const { userName, password, role } = req.body;
    if (!USER_ROLES.includes(role)) return res.status(400).json({ message: "Invalid role." });
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      user_id: await nextId("user_id"),
      user_name: userName.trim(),
      password: hash,
      role,
    });
    return res.status(201).json({ message: "User created successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Username already exists." });
    return res.status(500).json({ message: "Failed to create user." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json((await User.find().sort({ user_id: -1 }).lean()).map(strip));
  } catch {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const re = new RegExp(q, "i");
    return res.json(
      (await User.find({ $or: [{ user_name: re }, { role: re }] }).sort({ user_id: -1 }).lean()).map(strip)
    );
  } catch {
    return res.status(500).json({ message: "Failed to search users." });
  }
};

export const update = async (req, res) => {
  try {
    const doc = await User.findOne({ user_id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ message: "User not found." });
    const { userName, password, role } = req.body;
    if (userName?.trim()) doc.user_name = userName.trim();
    if (role && USER_ROLES.includes(role)) doc.role = role;
    if (password) doc.password = await bcrypt.hash(password, 10);
    await doc.save();
    return res.json({ message: "User updated successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Username already exists." });
    return res.status(500).json({ message: "Failed to update user." });
  }
};

export const remove = async (req, res) => {
  try {
    const doc = await User.findOne({ user_id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ message: "User not found." });
    if (doc.role === "admin" && (await User.countDocuments({ role: "admin" })) <= 1) {
      return res.status(403).json({ message: "Cannot delete the only administrator." });
    }
    if (await ReservationRental.findOne({ user_id: doc.user_id })) {
      return res.status(409).json({ message: "Cannot delete: user has recorded reservations." });
    }
    await User.deleteOne({ user_id: doc.user_id });
    return res.json({ message: "User deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete user." });
  }
};
