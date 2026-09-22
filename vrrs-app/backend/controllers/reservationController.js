import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";
import ReservationRental from "../models/ReservationRental.js";
import { RESERVATION_STATUSES, RENTAL_STATUSES } from "../constants/statuses.js";
import { nextId } from "../utils/ids.js";

const enrich = async (rows) => {
  const customers = Object.fromEntries((await Customer.find().lean()).map((c) => [c.customer_id, c]));
  const vehicles = Object.fromEntries((await Vehicle.find().lean()).map((v) => [v.vehicle_id, v]));
  const users = Object.fromEntries((await User.find().lean()).map((u) => [u.user_id, u]));
  return rows.map((r) => {
    const c = customers[r.customer_id] || {};
    const v = vehicles[r.vehicle_id] || {};
    const u = users[r.user_id] || {};
    return {
      ...r,
      full_name: c.full_name,
      national_id: c.national_id,
      customer_phone: c.phone,
      customer_email: c.email,
      plate_number: v.plate_number,
      brand: v.brand,
      model: v.model,
      year: v.year,
      vehicle_type: v.vehicle_type,
      recorded_by: u.user_name,
    };
  });
};

const validate = (b) => {
  if (!b.customerId) return "Select a customer.";
  if (!b.vehicleId) return "Select a vehicle.";
  if (!b.startDate || !b.endDate) return "Start and end dates are required.";
  if (b.startDate > b.endDate) return "Start date must be before or equal to end date.";
  return null;
};

export const create = async (req, res) => {
  try {
    const err = validate(req.body);
    if (err) return res.status(400).json({ message: err });
    const b = req.body;
    const userId = req.session?.user?.userId;
    await ReservationRental.create({
      reservation_rental_id: await nextId("reservation_rental_id"),
      reservation_date: b.reservationDate || null,
      start_date: b.startDate,
      end_date: b.endDate,
      reservation_status: b.reservationStatus || "Pending",
      rental_date: b.rentalDate || null,
      return_date: b.returnDate || null,
      rental_fee: Number(b.rentalFee || 0),
      rental_status: b.rentalStatus || "Not Started",
      customer_id: Number(b.customerId),
      vehicle_id: Number(b.vehicleId),
      user_id: userId,
    });
    return res.status(201).json({ message: "Reservation/rental recorded successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to create reservation/rental." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await ReservationRental.find().sort({ reservation_rental_id: -1 }).lean();
    return res.json(await enrich(rows));
  } catch {
    return res.status(500).json({ message: "Failed to fetch reservations." });
  }
};

export const search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const rows = await ReservationRental.find().sort({ reservation_rental_id: -1 }).lean();
    const enriched = await enrich(rows);
    if (!q) return res.json(enriched);
    const lq = q.toLowerCase();
    return res.json(
      enriched.filter(
        (r) =>
          (r.full_name || "").toLowerCase().includes(lq) ||
          (r.national_id || "").toLowerCase().includes(lq) ||
          (r.plate_number || "").toLowerCase().includes(lq) ||
          (r.brand || "").toLowerCase().includes(lq)
      )
    );
  } catch {
    return res.status(500).json({ message: "Failed to search reservations." });
  }
};

export const getById = async (req, res) => {
  try {
    const row = await ReservationRental.findOne({ reservation_rental_id: Number(req.params.id) }).lean();
    if (!row) return res.status(404).json({ message: "Record not found." });
    return res.json((await enrich([row]))[0]);
  } catch {
    return res.status(500).json({ message: "Failed to fetch record." });
  }
};

export const update = async (req, res) => {
  try {
    const err = validate(req.body);
    if (err) return res.status(400).json({ message: err });
    const b = req.body;
    const doc = await ReservationRental.findOneAndUpdate(
      { reservation_rental_id: Number(req.params.id) },
      {
        reservation_date: b.reservationDate || null,
        start_date: b.startDate,
        end_date: b.endDate,
        reservation_status: b.reservationStatus,
        rental_date: b.rentalDate || null,
        return_date: b.returnDate || null,
        rental_fee: Number(b.rentalFee || 0),
        rental_status: b.rentalStatus,
        customer_id: Number(b.customerId),
        vehicle_id: Number(b.vehicleId),
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Record not found." });
    return res.json({ message: "Reservation/rental updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update reservation/rental." });
  }
};

export const remove = async (req, res) => {
  try {
    const doc = await ReservationRental.findOneAndDelete({ reservation_rental_id: Number(req.params.id) });
    if (!doc) return res.status(404).json({ message: "Record not found." });
    return res.json({ message: "Reservation/rental deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete record." });
  }
};
