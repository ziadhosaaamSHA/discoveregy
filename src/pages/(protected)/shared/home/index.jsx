import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import TouristHome from "../../tourist/home";
import GuideHome from "../../guide/home";

// RoleHome dispatches the shared /home route to the current role's home screen.
export default function RoleHome() {
  const { user } = useAuth();

  if (user?.type === "guide") return <GuideHome />;
  if (user?.type === "admin") return <Navigate to="/admin" replace />;
  return <TouristHome />;
}
