import { useState } from "react";
import api, { getApiError } from "../api/client.js";
import {
  PageHeader, Card, CardHeader, Alert, Button, Field, Input,
  Tabs, DataTable, StatusBadge,
} from "../components/ui.jsx";

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? String(d).slice(0, 10) : "—");

const REPORT_COLUMNS = [
  { key: "name", label: "Customer", render: (r) => r.customer_full_name },
  { key: "plate", label: "Vehicle", render: (r) => `${r.vehicle_plate_number || "—"} · ${r.vehicle_brand || ""} ${r.vehicle_model || ""}`.trim() },
  { key: "resd", label: "Reservation", render: (r) => fmt(r.reservation_date) },
  { key: "start", label: "Rental start", render: (r) => fmt(r.rental_start_date) },
  { key: "end", label: "Rental end", render: (r) => fmt(r.rental_end_date) },
  { key: "rs", label: "Res. status", render: (r) => <StatusBadge status={r.reservation_status} /> },
  { key: "fee", label: "Fee", render: (r) => r.rental_fee ?? "—" },
  { key: "rt", label: "Rental status", render: (r) => <StatusBadge status={r.rental_status} /> },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("full");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [fullData, setFullData] = useState(null);
  const [rangeData, setRangeData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFull = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/reports/reservation-rental");
      setFullData(data);
      setRangeData(null);
    } catch (err) {
      setError(getApiError(err));
      setFullData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadByDate = async () => {
    setError("");
    if (!startDate || !endDate) {
      setError("Select start date and end date.");
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be before or equal to end date.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/reports", { params: { startDate, endDate } });
      setRangeData(data);
      setFullData(null);
    } catch (err) {
      setError(getApiError(err));
      setRangeData(null);
    } finally {
      setLoading(false);
    }
  };

  const generate = () => (tab === "full" ? loadFull() : loadByDate());
  const activeData = tab === "full" ? fullData : rangeData;
  const rows = activeData?.rows || [];

  return (
    <div className="max-w-full">
      <PageHeader title="Reports" subtitle="Reservation and rental reports for management" />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "full", label: "Full report" },
          { id: "by-date", label: "By date" },
        ]}
      />

      <Card className="mt-4 p-4 space-y-4">
        {tab === "by-date" && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-md">
            <Field label="Start date">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        )}
        <Button type="button" variant="primary" className="w-full sm:w-auto" onClick={generate} disabled={loading}>
          {loading ? "Loading…" : "Generate report"}
        </Button>
      </Card>

      {error && <Alert type="error" className="mt-4">{error}</Alert>}

      {activeData && (
        <Card className="mt-4">
          <CardHeader
            title={activeData.reportTitle}
            action={<span className="text-sm text-muted">{activeData.totalRecords} records</span>}
          />
          {tab === "by-date" && rangeData && (
            <p className="px-4 pt-3 text-sm text-muted">
              {fmt(rangeData.startDate)} — {fmt(rangeData.endDate)}
            </p>
          )}
          <div className="p-3 sm:p-4">
            <DataTable
              columns={REPORT_COLUMNS}
              rows={rows}
              rowKey={(r) => r.reservation_rental_id}
              emptyMessage={tab === "by-date" ? "No records in this date range." : "No records yet."}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
