import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Profile from "./pages/user/Profile";
import UploadKYC from "./pages/user/UploadKYC";
import AdminPage from "./pages/admin/AdminPage";
import Checkout from "./pages/rental/CheckOut";
import RentalSuccess from "./pages/rental/RentalSuccess";
import MyBooking from "./pages/user/MyBooking";
import ForgotPassword from "./components/forms/ForgotPassword";
import ResetPassword from "./components/forms/ResetPassword";
import LaptopDetails from "./pages/rental/LaptopDetails";
import LaptopPage from "./pages/rental/LaptopPage";
import { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")),
  );

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Prevent body scroll on admin pages — only the contentArea should scroll
  useEffect(() => {
    if (isAdmin) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isAdmin]);

  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* USER ROUTES */}
        <Route
          path="/profile"
          element={<Profile user={user} updateUser={updateUser} />}
        />
        <Route
          path="/upload-kyc"
          element={<UploadKYC updateUser={updateUser} />}
        />
        <Route path="/my-bookings" element={<MyBooking />} />

        {/* RENTAL ROUTES */}
        <Route path="/laptops" element={<LaptopPage />} />
        <Route path="/laptops/details/:id" element={<LaptopDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/rental-success/:id" element={<RentalSuccess />} />

        {/* ✅ ADMIN ROUTE (FIXED PROPERLY) */}
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
};

export default App;
