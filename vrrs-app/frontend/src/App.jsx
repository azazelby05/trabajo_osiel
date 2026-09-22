import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CustomersPage from "./pages/CustomersPage.jsx";
import VehiclesPage from "./pages/VehiclesPage.jsx";
import ReservationsPage from "./pages/ReservationsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/customers" replace />;
}

function ManagerRoute({ children }) {
  const { canReport, loading } = useAuth();
  if (loading) return null;
  return canReport ? children : <Navigate to="/customers" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/customers" replace />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="reports" element={<ManagerRoute><ReportsPage /></ManagerRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
