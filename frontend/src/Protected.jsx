import { Navigate } from "react-router-dom";

export default function Protected({ children, allowedRoles }) {

  const loggedIn = localStorage.getItem("loggedIn");
  const role = localStorage.getItem("role");

  // ✨ if not logged in redirect
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // ✨ if allowedRoles prop exists, check role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/not-allowed" replace />;
  }

  return children;
}