import React from "react";
import { Link } from "react-router-dom";
import "./Pages.css";

const NotFound = () => {
  return (
    <div className="page not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/lessons" className="btn btn-secondary">
            Browse Lessons
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
