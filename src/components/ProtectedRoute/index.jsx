import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../shared/utils/identity";

const ROLE_HOME = {
  tourist: "/tourist/home",
  guide: "/guide/home",
  admin: "/admin",
};

// ProtectedRoute gates authenticated pages and optionally enforces role access.
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentRole = normalizeRole(user?.type) || "tourist";
  const allowed = Array.isArray(allowedRoles) && allowedRoles.length
    ? allowedRoles.map((role) => normalizeRole(role)).filter(Boolean)
    : null;

  if (allowed && !allowed.includes(currentRole)) {
    return <Navigate to={ROLE_HOME[currentRole] || "/home"} replace />;
  }

  return <Outlet />;
}
