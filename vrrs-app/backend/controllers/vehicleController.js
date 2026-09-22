import Vehicle from "../models/Vehicle.js";
import ReservationRental from "../models/ReservationRental.js";
import { VEHICLE_STATUSES } from "../constants/statuses.js";
import { nextId } from "../utils/ids.js";

const strip = (d) => {
  const o = d.toObject ? d.toObject() : d;
  const { _id, __v, ...r } = o;
  return r;
};

export const create = async (req, res) => {
  try {
    const { plateNumber, brand, model, year, vehicleType, purchasePrice, status } = req.body;
    const st = status || "Available";
    if (!VEHICLE_STATUSES.includes(st)) return res.status(400).json({ message: "Invalid vehicle status." });
    await Vehicle.create({
      vehicle_id: await nextId("vehicle_id"),
      plate_number: plateNumber.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      vehicle_type: vehicleType.trim(),
      purchase_price: Number(purchasePrice),
      status: st,
    });
    return res.status(201).json({ message: "Vehicle added successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Plate number already exists." });
    return res.status(500).json({ message: "Failed to add vehicle." });
  }
};

export const getAll = async (_req, res) => {
  try {
    return res.json((await Vehicle.find().sort({ vehicle_id: -1 }).lean()).map(strip));
  } catch {
    return res.status(500).json({ message: "Failed to fetch vehicles." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return getAll(req, res);
    const re = new RegExp(q, "i");
    return res.json(
      (
        await Vehicle.find({
          $or: [{ plate_number: re }, { brand: re }, { model: re }, { vehicle_type: re }],
        })
          .sort({ vehicle_id: -1 })
          .lean()
      ).map(strip)
    );
  } catch {
    return res.status(500).json({ message: "Failed to search vehicles." });
  }
};

export const getById = async (req, res) => {
  try {
    const doc = await Vehicle.findOne({ vehicle_id: Number(req.params.id) }).lean();
    if (!doc) return res.status(404).json({ message: "Vehicle not found." });
    return res.json(strip(doc));
  } catch {
    return res.status(500).json({ message: "Failed to fetch vehicle." });
  }
};

export const update = async (req, res) => {
  try {
    const b = req.body;
    const doc = await Vehicle.findOneAndUpdate(
      { vehicle_id: Number(req.params.id) },
      {
        plate_number: b.plateNumber?.trim(),
        brand: b.brand?.trim(),
        model: b.model?.trim(),
        year: Number(b.year),
        vehicle_type: b.vehicleType?.trim(),
        purchase_price: Number(b.purchasePrice),
        status: b.status,
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Vehicle not found." });
    return res.json({ message: "Vehicle updated successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Plate number already exists." });
    return res.status(500).json({ message: "Failed to update vehicle." });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (await ReservationRental.findOne({ vehicle_id: id })) {
      return res.status(409).json({ message: "Cannot delete: vehicle has reservations/rentals." });
    }
    const doc = await Vehicle.findOneAndDelete({ vehicle_id: id });
    if (!doc) return res.status(404).json({ message: "Vehicle not found." });
    return res.json({ message: "Vehicle deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete vehicle." });
  }
};
