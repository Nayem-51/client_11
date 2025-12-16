import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, user, logout, refreshUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Refresh user data on mount and periodically to sync premium status
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  // Refresh when user returns to tab (after payment completion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log("Tab became visible - refreshing user data...");
        refreshUser();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, refreshUser]);

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
    setMobileMenuOpen(false);
  };

  // Close mobile menu on route change or outside click
  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

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
                      <img 
              src="/logo.png" 
              alt="Digital Life Lessons" 
              className="logo-icon" 
              style={{ height: "32px", width: "32px", objectFit: "contain" }}
            />
          <span className="logo-text">Digital Life Lessons</span>
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <nav className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/lessons"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Public Lessons
          </NavLink>

          {isAuthenticated && (
            <>
              {user?.role === "admin" ? (
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/dashboard/add-lesson"
                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Lesson
                  </NavLink>
                  <NavLink
                    to="/dashboard/my-lessons"
                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Lessons
                  </NavLink>
                </>
              )}

              {!user?.role?.includes("admin") &&
                (user?.isPremium ? (
                  <span className="nav-badge" aria-label="Premium user">
                    Premium ⭐
                  </span>
                ) : (
                  <NavLink
                    to="/pricing"
                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing/Upgrade
                  </NavLink>
                ))}
            </>
          )}
        </nav>

        <div className="header-right">
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link
                to="/login"
                className="btn btn-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-signup"
                onClick={() => setMobileMenuOpen(false)}
              >
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
