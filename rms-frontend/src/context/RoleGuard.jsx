// import { Navigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// export default function RoleGuard({ role, children }) {
//   const token = localStorage.getItem("token");
//   if (!token) return <Navigate to="/login" replace />;

//   let user;
//   try {
//     user = jwtDecode(token);
//   } catch {
//     return <Navigate to="/login" replace />;
//   }

//   return user.role === role
//     ? children
//     : <Navigate to="/dashboard" replace />;
// }

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleGuard({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === role
    ? children
    : <Navigate to="/dashboard" replace />;
}
