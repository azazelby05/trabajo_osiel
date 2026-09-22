import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, DataTable, FormActions, FormLayout, FormRow, Message } from "../components/ui.jsx";

const empty = { fullName: "", nationalId: "", phone: "", email: "", address: "" };
const toForm = (r) => ({
  fullName: r.full_name || "",
  nationalId: r.national_id || "",
  phone: r.phone || "",
  email: r.email || "",
  address: r.address || "",
});

export default function CustomersPage() {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (q = searchQuery) => {
    const url = q.trim() ? `/customers/search?q=${encodeURIComponent(q.trim())}` : "/customers";
    const { data } = await api.get(url);
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (editingId) await api.put(`/customers/${editingId}`, form);
      else await api.post("/customers", form);
      setMessage(editingId ? "Customer updated." : "Customer added.");
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
      <PageHeader title="Customers" subtitle="Manage customer records (CRUD + search)" />
      <Card className="mb-4 p-4">
        <FormLayout onSubmit={submit}>
          <Field label="Full name"><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
          <Field label="National ID"><Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <FormRow full>
            <FormActions>
              <Button type="submit" variant="primary" disabled={loading}>{editingId ? "Update" : "Add"} customer</Button>
              {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</Button>}
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </FormRow>
        </FormLayout>
      </Card>
      <Card className="mb-4 p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(searchQuery).catch((err) => setError(getApiError(err))); }} className="flex flex-wrap gap-2 items-end">
          <Field label="Search" className="flex-1 min-w-[200px]"><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name, ID, phone, email" /></Field>
          <Button type="submit" variant="primary">Search</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Customer list" />
        <DataTable
          columns={[
            { key: "name", label: "Name", render: (r) => r.full_name },
            { key: "id", label: "National ID", render: (r) => r.national_id },
            { key: "phone", label: "Phone", render: (r) => r.phone },
            { key: "email", label: "Email", render: (r) => r.email },
            { key: "act", label: "Actions", render: (r) => (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setEditingId(r.customer_id); setForm(toForm(r)); }}>Edit</Button>
                <Button type="button" variant="danger" onClick={async () => { if (!confirm("Delete?")) return; await api.delete(`/customers/${r.customer_id}`); await load(); }}>Delete</Button>
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(r) => r.customer_id}
        />
      </Card>
    </div>
  );
}
