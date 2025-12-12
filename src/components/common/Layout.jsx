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
      <Toaster position="top-center" reverseOrder={false} />
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
