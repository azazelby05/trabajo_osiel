import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api, { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import { Button, Field, Input } from "../components/ui.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/customers" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user);
      navigate("/customers", { replace: true });
    } catch (err) {
      setError(getApiError(err, "Login failed."));
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="SwitchWheels Enterprise — Vehicle Rental & Reservation">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username">
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </Field>
        <Field label="Password">
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="primary" className="w-full">Login</Button>
      </form>
      <p className="mt-4 text-xs text-muted">
        Session-based login. Accounts are created by an administrator under Users (no public registration).
      </p>
    </AuthShell>
  );
}
