import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Lessons</span>
        </Link>

        <nav className="navbar">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/lessons" className="nav-link">
            Public Lessons
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/dashboard/add-lesson" className="nav-link">
                Add Lesson
              </Link>
              <Link to="/dashboard/my-lessons" className="nav-link">
                My Lessons
              </Link>
              {user?.isPremium ? (
                <span className="nav-badge" aria-label="Premium user">
                  Premium ⭐
                </span>
              ) : (
                <Link to="/pricing" className="nav-link">
                  Pricing/Upgrade
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="header-right">
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-login">
                Login
              </Link>
              <Link to="/register" className="btn btn-signup">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="user-dropdown">
              <button className="avatar-btn" onClick={toggleDropdown}>
                <img
                  src={user?.photoURL || "/default-avatar.png"}
                  alt={user?.name || user?.displayName || "User"}
                  className="avatar-img"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-name">{user?.name || user?.displayName}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
