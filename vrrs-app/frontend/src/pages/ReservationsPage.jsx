import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { RESERVATION_STATUSES, RENTAL_STATUSES } from "../constants/statuses.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, Select, StatusBadge, DataTable, FormActions, FormLayout, FormRow, Message } from "../components/ui.jsx";

const fmt = (d) => (d ? String(d).slice(0, 10) : "");
const empty = {
  customerId: "", vehicleId: "", reservationDate: "", startDate: "", endDate: "",
  reservationStatus: "Pending", rentalDate: "", returnDate: "", rentalFee: "0", rentalStatus: "Not Started",
};
const toForm = (r) => ({
  customerId: String(r.customer_id || ""),
  vehicleId: String(r.vehicle_id || ""),
  reservationDate: fmt(r.reservation_date),
  startDate: fmt(r.start_date),
  endDate: fmt(r.end_date),
  reservationStatus: r.reservation_status || "Pending",
  rentalDate: fmt(r.rental_date),
  returnDate: fmt(r.return_date),
  rentalFee: String(r.rental_fee ?? 0),
  rentalStatus: r.rental_status || "Not Started",
});

export default function ReservationsPage() {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadMeta = async () => {
    const [c, v] = await Promise.all([api.get("/customers"), api.get("/vehicles")]);
    setCustomers(c.data || []);
    setVehicles(v.data || []);
  };

  const load = async (q = searchQuery) => {
    const url = q.trim() ? `/reservations/search?q=${encodeURIComponent(q.trim())}` : "/reservations";
    const { data } = await api.get(url);
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMeta().then(() => load()).catch((err) => setError(getApiError(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await api.put(`/reservations/${editingId}`, form);
      else await api.post("/reservations", form);
      setMessage(editingId ? "Record updated." : "Reservation/rental recorded.");
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div>
      <PageHeader title="Reservations & Rentals" subtitle="Linked to one customer and one vehicle per record" />
      <Card className="mb-4 p-4">
        <FormLayout onSubmit={submit} cols={3}>
          <Field label="Customer">
            <Select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>{c.full_name} ({c.national_id})</option>
              ))}
            </Select>
          </Field>
          <Field label="Vehicle">
            <Select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>{v.plate_number} — {v.brand} {v.model}</option>
              ))}
            </Select>
          </Field>
          <Field label="Reservation date"><Input type="date" value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} /></Field>
          <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <Field label="Reservation status">
            <Select value={form.reservationStatus} onChange={(e) => setForm({ ...form, reservationStatus: e.target.value })}>
              {RESERVATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Rental date"><Input type="date" value={form.rentalDate} onChange={(e) => setForm({ ...form, rentalDate: e.target.value })} /></Field>
          <Field label="Return date"><Input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} /></Field>
          <Field label="Rental fee"><Input type="number" value={form.rentalFee} onChange={(e) => setForm({ ...form, rentalFee: e.target.value })} /></Field>
          <Field label="Rental status">
            <Select value={form.rentalStatus} onChange={(e) => setForm({ ...form, rentalStatus: e.target.value })}>
              {RENTAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <FormRow full>
            <FormActions>
              <Button type="submit" variant="primary">{editingId ? "Update" : "Record"} reservation/rental</Button>
              {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</Button>}
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </FormRow>
        </FormLayout>
      </Card>
      <Card className="mb-4 p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(searchQuery); }} className="flex gap-2 items-end">
          <Field label="Search" className="flex-1"><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Customer, plate, brand" /></Field>
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Reservation / rental list" />
        <DataTable
          columns={[
            { key: "cust", label: "Customer", render: (r) => r.full_name },
            { key: "veh", label: "Vehicle", render: (r) => `${r.plate_number} (${r.brand})` },
            { key: "start", label: "Start", render: (r) => fmt(r.start_date) },
            { key: "end", label: "End", render: (r) => fmt(r.end_date) },
            { key: "rs", label: "Res. status", render: (r) => <StatusBadge status={r.reservation_status} /> },
            { key: "rt", label: "Rental status", render: (r) => <StatusBadge status={r.rental_status} /> },
            { key: "fee", label: "Fee", render: (r) => r.rental_fee },
            { key: "by", label: "Recorded by", render: (r) => r.recorded_by },
            { key: "act", label: "Actions", render: (r) => (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setEditingId(r.reservation_rental_id); setForm(toForm(r)); }}>Edit</Button>
                <Button type="button" variant="danger" onClick={async () => { if (!confirm("Delete?")) return; await api.delete(`/reservations/${r.reservation_rental_id}`); await load(); }}>Delete</Button>
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(r) => r.reservation_rental_id}
        />
      </Card>
    </div>
  );
}
