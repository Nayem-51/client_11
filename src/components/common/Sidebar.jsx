import React from "react";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="user-profile">
          <img
            src={user?.photoURL || "/default-avatar.png"}
            alt={user?.name}
            className="avatar"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <h4>Navigation</h4>
          <ul>
            <li>
              <a href="/dashboard">My Dashboard</a>
            </li>
            <li>
              <a href="/dashboard/add-lesson">Add Lesson</a>
            </li>
            <li>
              <a href="/dashboard/my-lessons">My Lessons</a>
            </li>
            <li>
              <a href="/dashboard/favorites">My Favorites</a>
            </li>
            {user?.role === "admin" && (
              <li>
                <a href="/dashboard/admin">Admin Panel</a>
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
