import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }

  const getUserInitials = () => {
    const name = user?.displayName || user?.name || user?.email || "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="user-profile">
          {user?.photoURL ? (
            <>
              <img
                src={user.photoURL}
                alt={user.displayName || user.name || "User"}
                className="avatar"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="avatar avatar-initials"
                style={{ display: "none" }}
              >
                {getUserInitials()}
              </div>
            </>
          ) : (
            <div className="avatar avatar-initials">{getUserInitials()}</div>
          )}
          <h3>{user?.displayName || user?.name}</h3>
          <p>{user?.email}</p>
          <span
            className={`badge ${
              user?.role === "admin" ? "badge-success" : "badge-neutral"
            }`}
            style={{ marginTop: "4px" }}
          >
            {user?.role === "admin" ? "Admin" : "Student"}
          </span>
        </div>

        <nav className="sidebar-nav">
          {/* ADMIN DASHBOARD - Exclusive View */}
          {user?.role === "admin" ? (
            <div className="nav-section">
              <h4 className="nav-header" style={{ color: "#4338ca" }}>
                Admin Dashboard
              </h4>
              <ul>
                <li>
                  <NavLink to="/dashboard/admin" end>
                    Admin Overview
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/admin/manage-users">
                    Manage Users
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/admin/manage-lessons">
                    Manage Lessons
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/admin/reported-lessons">
                    Reported Lessons
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/admin/profile">
                    Admin Profile
                  </NavLink>
                </li>
              </ul>
            </div>
          ) : (
            /* USER DASHBOARD - Exclusive View */
            <div className="nav-section">
              <h4 className="nav-header">User Dashboard</h4>
              <ul>
                <li>
                  <NavLink to="/dashboard" end>
                    My Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/add-lesson">
                    Add Lesson
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/my-lessons">
                    My Lessons
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/my-favorites">
                    My Favorites
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/profile">
                    My Profile
                  </NavLink>
                </li>
              </ul>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <p>Version 1.1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
