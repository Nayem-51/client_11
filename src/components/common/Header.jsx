import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debug: log when user changes (especially isPremium)
  useEffect(() => {
    if (user?.isPremium) {
      console.log("✅ Header: User is Premium -", user.email);
    } else if (user) {
      console.log("ℹ️ Header: User is Free -", user.email);
    }
  }, [user?.isPremium, user?.email]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Generate avatar or initials
  const getAvatarContent = () => {
    if (user?.photoURL) {
      return (
        <img
          src={user.photoURL}
          alt={user.displayName || user.name || "User"}
          className="avatar-img"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return null;
  };

  const getUserInitials = () => {
    const name = user?.displayName || user?.name || user?.email || "U";
    return name.slice(0, 2).toUpperCase();
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
              {user?.role === "admin" ? (
                <Link to="/dashboard/admin" className="nav-link">
                  Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/dashboard/add-lesson" className="nav-link">
                    Add Lesson
                  </Link>
                  <Link to="/dashboard/my-lessons" className="nav-link">
                    My Lessons
                  </Link>
                </>
              )}

              {!user?.role?.includes("admin") && // Hide pricing for admins or keep it? Requirement implies admins don't pay but maybe for consistency. Let's hide unrelated user stuff if strict separation requested. But user might want to see pricing page. Text says "Admin navbar... follows admin dashboard". I'll keep Pricing for regular users, maybe hide for Admin if they are superusers. Let's stick to the request "Change the admin navbar so that... it follows the admin dashboard".
                (user?.isPremium ? (
                  <span className="nav-badge" aria-label="Premium user">
                    Premium ⭐
                  </span>
                ) : (
                  <Link to="/pricing" className="nav-link">
                    Pricing/Upgrade
                  </Link>
                ))}
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
            <div className="user-dropdown" ref={dropdownRef}>
              <button className="avatar-btn" onClick={toggleDropdown}>
                {user?.photoURL ? (
                  <>
                    <img
                      src={user.photoURL}
                      alt={user.displayName || user.name || "User"}
                      className="avatar-img"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="avatar-initials"
                      style={{ display: "none" }}
                    >
                      {getUserInitials()}
                    </div>
                  </>
                ) : (
                  <div className="avatar-initials">{getUserInitials()}</div>
                )}
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-name">
                      {user?.displayName || user?.name}
                    </p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/dashboard/profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to={
                      user?.role === "admin" ? "/dashboard/admin" : "/dashboard"
                    }
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
