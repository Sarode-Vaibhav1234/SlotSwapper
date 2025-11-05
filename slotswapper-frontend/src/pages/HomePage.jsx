// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-6 pt-28 pb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            SlotSwapper
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10">
          Effortlessly swap and manage your schedule slots. Connect, trade availability,
          and optimize your time like never before.
        </p>

        {/* Buttons Under Hero */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg text-lg font-medium hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to My Calendar
            </Link>
          )}
        </div>
      </div>

      {/* Features */}
      <section className="bg-white py-20 mt-6 rounded-t-3xl shadow-inner">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-14">
            Why Choose SlotSwapper?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-blue-50 p-8 rounded-xl shadow-md text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Smart Calendar</h3>
              <p className="text-gray-600">Manage and visualize your schedule seamlessly.</p>
            </div>

            <div className="bg-indigo-50 p-8 rounded-xl shadow-md text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Easy Swapping</h3>
              <p className="text-gray-600">Send and receive swap requests instantly.</p>
            </div>

            <div className="bg-yellow-50 p-8 rounded-xl shadow-md text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Fast Updates</h3>
              <p className="text-gray-600">Real-time request and status tracking.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
