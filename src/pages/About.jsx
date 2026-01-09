import React from "react";
import { Link } from "react-router-dom";
import "../index.css"; // Ensure global styles are applied

const About = () => {
  return (
    <div className="page about-page">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Who We Are</p>
            <h1>Empowering Growth Through Shared Wisdom</h1>
            <p className="section-subtitle">
              Digital Life Lessons is a community-driven platform where real stories become practical guides for others.
            </p>
          </div>

          <div className="flex flex-col gap-8 my-8">
            <div className="card p-6">
              <h3>Our Mission</h3>
              <p>
                To democraticize life experience. We believe that everyone has faced challenges that taught them something valuable. By sharing these "life lessons," we can help others navigate their own paths with more confidence and less friction.
              </p>
            </div>

            <div className="card p-6">
              <h3>How It Works</h3>
              <p>
                Our platform connects mentors—everyday people with lived experience—with learners. Whether it's overcoming professional burnout, mastering a personal habit, or navigating complex relationships, there is a lesson here for you.
              </p>
            </div>

            <div className="card p-6">
              <h3>Join the Movement</h3>
              <p>
                We are more than just a library of content; we are a community of resilient individuals. Join us today to start learning, or become a contributor and share your own journey.
              </p>
              <div className="mt-4">
                <Link to="/register" className="btn btn-primary">
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
