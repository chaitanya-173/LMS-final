import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  // Wait until user verification is complete
  if (loading) {
    return null; // or a loading spinner
  }

  // If no user or token after loading => redirect
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role is not allowed => redirect to home or unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
