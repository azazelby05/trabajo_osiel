import { useEffect, useState } from "react";
import api, { getApiError } from "../api/client.js";
import { USER_ROLES } from "../constants/statuses.js";
import { PageHeader, Card, CardHeader, Button, Field, Input, Select, DataTable, FormActions, FormLayout, FormRow, Message } from "../components/ui.jsx";

const empty = { userName: "", password: "", role: "staff" };

export default function UsersPage() {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await api.get("/users");
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(getApiError(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const body = { userName: form.userName, role: form.role };
        if (form.password) body.password = form.password;
        await api.put(`/users/${editingId}`, body);
      } else {
        await api.post("/users", form);
      }
      setMessage("User saved.");
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div>
      <PageHeader title="Users" subtitle="Session accounts with roles (admin, manager, staff)" />
      <Card className="mb-4 p-4">
        <FormLayout onSubmit={submit} cols={3}>
          <Field label="Username"><Input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} /></Field>
          <Field label={editingId ? "New password (optional)" : "Password"}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <FormRow full>
            <FormActions>
              <Button type="submit" variant="primary">{editingId ? "Update" : "Create"} user</Button>
              {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</Button>}
              <Message type="success">{message}</Message>
              <Message type="error">{error}</Message>
            </FormActions>
          </FormRow>
        </FormLayout>
      </Card>
      <Card>
        <CardHeader title="User list" />
        <DataTable
          columns={[
            { key: "u", label: "Username", render: (r) => r.user_name },
            { key: "r", label: "Role", render: (r) => r.role },
            { key: "act", label: "Actions", render: (r) => (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setEditingId(r.user_id); setForm({ userName: r.user_name, password: "", role: r.role }); }}>Edit</Button>
                <Button type="button" variant="danger" onClick={async () => { if (!confirm("Delete user?")) return; await api.delete(`/users/${r.user_id}`); await load(); }}>Delete</Button>
              </div>
            ) },
          ]}
          rows={rows}
          rowKey={(r) => r.user_id}
        />
      </Card>
    </div>
  );
}
