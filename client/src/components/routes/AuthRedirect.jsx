import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth(); // assume loading mile; agar nahi milta to hata do

  // Jab tak auth status load ho raha ho (token verify etc.), kuch bhi redirect na karo
  if (loading) return null; // ya spinner

  // Not logged in -> allow user to see the auth page (login/signup)
  if (!user) {
    return children;
  }

  // Logged in -> role-wise redirect
  if (user.role === "instructor") {
    return <Navigate to="/instructor/dashboard" replace />;
  }

  // default: student (ya koi aur)
  return <Navigate to="/home" replace />;
};

export default AuthRedirect;
