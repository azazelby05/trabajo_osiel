import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import ReservationRental from "../models/ReservationRental.js";

const fmt = (d) => {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  const s = String(d);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
};

const inRange = (dateStr, start, end) => {
  if (!dateStr) return false;
  const d = fmt(dateStr);
  return d >= start && d <= end;
};

async function buildReportRows(filterFn = null) {
  const rows = await ReservationRental.find().sort({ reservation_rental_id: -1 }).lean();
  const customers = Object.fromEntries((await Customer.find().lean()).map((c) => [c.customer_id, c]));
  const vehicles = Object.fromEntries((await Vehicle.find().lean()).map((v) => [v.vehicle_id, v]));
  const filtered = filterFn ? rows.filter(filterFn) : rows;
  return filtered.map((r) => {
    const c = customers[r.customer_id] || {};
    const v = vehicles[r.vehicle_id] || {};
    return {
      customer_full_name: c.full_name,
      national_id: c.national_id,
      phone_number: c.phone,
      vehicle_plate_number: v.plate_number,
      vehicle_brand: v.brand,
      vehicle_model: v.model,
      vehicle_year: v.year,
      vehicle_type: v.vehicle_type,
      reservation_date: fmt(r.reservation_date),
      rental_start_date: fmt(r.start_date),
      rental_end_date: fmt(r.end_date),
      reservation_status: r.reservation_status,
      rental_date: fmt(r.rental_date),
      return_date: fmt(r.return_date),
      rental_fee: r.rental_fee,
      rental_status: r.rental_status,
      reservation_rental_id: r.reservation_rental_id,
    };
  });
}

export const getReservationRentalReport = async (_req, res) => {
  try {
    const report = await buildReportRows();
    return res.json({
      reportTitle: "Customer Vehicle Reservation Rental Report",
      company: "SwitchWheels Enterprise — Huye",
      totalRecords: report.length,
      rows: report,
    });
  } catch {
    return res.status(500).json({ message: "Failed to generate report." });
  }
};

export const getReportByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required." });
    }
    if (startDate > endDate) {
      return res.status(400).json({ message: "Start date must be before or equal to end date." });
    }

    const report = await buildReportRows(
      (r) => inRange(r.reservation_date, startDate, endDate) || inRange(r.start_date, startDate, endDate)
    );

    return res.json({
      reportTitle: "Reservation & Rental Report by Date",
      company: "SwitchWheels Enterprise — Huye",
      startDate,
      endDate,
      totalRecords: report.length,
      rows: report,
    });
  } catch {
    return res.status(500).json({ message: "Failed to generate report." });
  }
};
