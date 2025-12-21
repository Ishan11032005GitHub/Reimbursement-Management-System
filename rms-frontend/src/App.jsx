import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import RoleGuard from "./context/RoleGuard";

import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import RequestList from "./pages/RequestList";
import RequestDetail from "./pages/RequestDetail";
import ManagerRequests from "./pages/ManagerRequests";
import OpenRequests from "./pages/OpenRequests";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected (User + Manager) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<RequestList />} />
            <Route path="/requests/new" element={<CreateRequest />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
            <Route path="/requests/open" element={<OpenRequests />} />
            
            {/* Manager only */}
            <Route
              path="/manager/requests"
              element={
                <RoleGuard role="MANAGER">
                  <ManagerRequests />
                </RoleGuard>
              }
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;
