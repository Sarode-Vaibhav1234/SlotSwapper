// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="text-2xl font-bold tracking-wide">
        <Link to="/" className="hover:text-yellow-300 transition-colors duration-300">
          SlotSwapper
        </Link>
      </div>

      <div className="flex items-center space-x-4 text-sm md:text-base">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
              My Calendar
            </Link>
            <Link to="/marketplace" className="hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
              Marketplace
            </Link>
            <Link to="/requests" className="hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
              Requests
            </Link>
            <button
              onClick={onLogout}
              className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-md"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = () => setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("authChanged", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("authChanged", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/"); // ✅ send to Home
    window.dispatchEvent(new Event("authChanged"));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={() => {
                  setIsAuthenticated(true);
                  window.dispatchEvent(new Event("authChanged"));
                  navigate("/"); // ✅ go Home
                }}
              />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage
                onRegister={() => {
                  setIsAuthenticated(true);
                  window.dispatchEvent(new Event("authChanged"));
                  navigate("/"); // ✅ go Home
                }}
              />
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/requests" element={<Requests />} />
          </Route>
        </Routes>
      </main>

      <footer className="bg-blue-600 text-white text-center py-4 mt-auto shadow-inner">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} <span className="font-semibold">SlotSwapper</span>. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
