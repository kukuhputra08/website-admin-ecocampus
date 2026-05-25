import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";
import Buildings from "./pages/Buildings";
import Rooms from "./pages/Rooms";
import Reports from "./pages/Reports";
import Challenges from "./pages/Challenges";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Redemptions from "./pages/Redemptions";
// import DevTools from "./pages/DevTools";
// import StudentSimulator from "./pages/StudentSimulator";
// import TestUpload from "./pages/TestUpload";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/events" element={<Events />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/redemtion" element={<Redemptions />} />
          <Route path="/profile" element={<Profile />} />

          {/* <Route path="/dev-tools" element={<DevTools />} />
          <Route path="/student-simulator" element={<StudentSimulator />} />
          <Route path="/test-upload" element={<TestUpload />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;