import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const authed = localStorage.getItem("isAuthenticated") === "true";
  return authed ? children : <Navigate to="/login" replace />;
}