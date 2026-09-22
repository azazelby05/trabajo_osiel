import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { VEHICLE_STATUSES } from "../constants/statuses.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, Select, StatusBadge, DataTable, FormActions, FormLayout, FormRow, Message } from "../components/ui.jsx";

const empty = { plateNumber: "", brand: "", model: "", year: "", vehicleType: "", purchasePrice: "", status: "Available" };
const toForm = (r) => ({
  plateNumber: r.plate_number || "",
  brand: r.brand || "",
  model: r.model || "",
  year: String(r.year || ""),
  vehicleType: r.vehicle_type || "",
  purchasePrice: String(r.purchase_price ?? ""),
  status: r.status || "Available",
});

export default function VehiclesPage() {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (q = searchQuery) => {
    const url = q.trim() ? `/vehicles/search?q=${encodeURIComponent(q.trim())}` : "/vehicles";
    const { data } = await api.get(url);
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) await api.put(`/vehicles/${editingId}`, form);
      else await api.post("/vehicles", form);
      setMessage(editingId ? "Vehicle updated." : "Vehicle added.");
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Vehicles" subtitle="Fleet inventory — plate, brand, model, status" />
      <Card className="mb-4 p-4">
        <FormLayout onSubmit={submit} cols={3}>
          <Field label="Plate number"><Input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} /></Field>
          <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
          <Field label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
          <Field label="Year"><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Field>
          <Field label="Type"><Input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} /></Field>
          <Field label="Purchase price"><Input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <FormRow full>
            <FormActions>
              <Button type="submit" variant="primary" disabled={loading}>{editingId ? "Update" : "Add"} vehicle</Button>
              {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</Button>}
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </FormRow>
        </FormLayout>
      </Card>
      <Card className="mb-4 p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(searchQuery); }} className="flex gap-2 items-end">
          <Field label="Search" className="flex-1"><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></Field>
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Vehicle list" />
        <DataTable
          columns={[
            { key: "plate", label: "Plate", render: (r) => r.plate_number },
            { key: "brand", label: "Brand", render: (r) => r.brand },
            { key: "model", label: "Model", render: (r) => r.model },
            { key: "year", label: "Year", render: (r) => r.year },
            { key: "type", label: "Type", render: (r) => r.vehicle_type },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "act", label: "Actions", render: (r) => (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setEditingId(r.vehicle_id); setForm(toForm(r)); }}>Edit</Button>
                <Button type="button" variant="danger" onClick={async () => { if (!confirm("Delete?")) return; await api.delete(`/vehicles/${r.vehicle_id}`); await load(); }}>Delete</Button>
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(r) => r.vehicle_id}
        />
      </Card>
    </div>
  );
}
