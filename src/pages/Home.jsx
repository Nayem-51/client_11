import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Lessons App</h1>
          <p>Learn and share knowledge with our community</p>
          <div className="cta-buttons">
            <Link to="/lessons" className="btn btn-primary">
              Browse Lessons
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-secondary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">✏️</span>
            <h3>Create Lessons</h3>
            <p>Share your knowledge by creating comprehensive lessons</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📚</span>
            <h3>Learn Together</h3>
            <p>Learn from expert instructors and community members</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>Save Favorites</h3>
            <p>Bookmark lessons you want to learn later</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
