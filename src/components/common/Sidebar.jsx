import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const getUserInitials = () => {
    const name = user?.displayName || user?.name || user?.email || "U";
    return name.slice(0, 2).toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

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
          <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-neutral'}`} style={{marginTop: '4px'}}>
            {user?.role === 'admin' ? 'Admin' : 'Student'}
          </span>
        </div>

        <nav className="sidebar-nav">
          {/* ADMIN DASHBOARD - Exclusive View */}
          {user?.role === "admin" ? (
            <div className="nav-section">
              <h4 className="nav-header" style={{ color: '#4338ca' }}>Admin Dashboard</h4>
              <ul>
                <li>
                  <Link to="/dashboard/admin" className={isActive("/dashboard/admin") ? "active" : ""}>
                    Admin Overview
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/admin/manage-users" className={isActive("/dashboard/admin/manage-users") ? "active" : ""}>
                    Manage Users
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/admin/manage-lessons" className={isActive("/dashboard/admin/manage-lessons") ? "active" : ""}>
                    Manage Lessons
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/admin/reported-lessons" className={isActive("/dashboard/admin/reported-lessons") ? "active" : ""}>
                    Reported Lessons
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/admin/manage-categories" className={isActive("/dashboard/admin/manage-categories") ? "active" : ""}>
                    Manage Categories
                  </Link>
                </li>
                 <li>
                  <Link to="/dashboard/admin/profile" className={isActive("/dashboard/admin/profile") ? "active" : ""}>
                    Admin Profile
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            /* USER DASHBOARD - Exclusive View */
            <div className="nav-section">
              <h4 className="nav-header">User Dashboard</h4>
              <ul>
                <li>
                  <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
                    My Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/add-lesson" className={isActive("/dashboard/add-lesson") ? "active" : ""}>
                    Add Lesson
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/my-lessons" className={isActive("/dashboard/my-lessons") ? "active" : ""}>
                    My Lessons
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/my-favorites" className={isActive("/dashboard/my-favorites") ? "active" : ""}>
                    My Favorites
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/profile" className={isActive("/dashboard/profile") ? "active" : ""}>
                    My Profile
                  </Link>
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
