import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  tourist: "/tourist/home",
  guide: "/guide/home",
  admin: "/admin",
};

function normalizeRole(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "tour guide" || normalized === "tourguide") return "guide";
  if (normalized === "administrator") return "admin";
  if (normalized === "guide" || normalized === "admin") return normalized;
  return "tourist";
}

// ProtectedRoute gates authenticated pages and optionally enforces role access.
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentRole = normalizeRole(user?.type);
  const allowed = Array.isArray(allowedRoles) && allowedRoles.length
    ? allowedRoles.map(normalizeRole)
    : null;

  if (allowed && !allowed.includes(currentRole)) {
    return <Navigate to={ROLE_HOME[currentRole] || "/home"} replace />;
  }

  return <Outlet />;
}
