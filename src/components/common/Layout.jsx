import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import "./Layout.css";

const Layout = () => {
  const location = useLocation();
  const is404 = location.pathname === "*" || location.pathname === "/404";

  if (is404) {
    return <Outlet />;
  }

  return (
    <div className="layout">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          style: {
            background: '#1f2937',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        }}
      />
      <Header />
      <div className="layout-container">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
