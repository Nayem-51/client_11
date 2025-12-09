import React from "react";
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
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="avatar avatar-initials" style={{ display: 'none' }}>
                {getUserInitials()}
              </div>
            </>
          ) : (
            <div className="avatar avatar-initials">
              {getUserInitials()}
            </div>
          )}
          <h3>{user?.displayName || user?.name}</h3>
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
