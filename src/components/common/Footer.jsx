import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">Digital Life Lessons</span>
            </div>
            <p className="footer-description">
              A platform for sharing and learning valuable lessons from experts
              around the world.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/lessons">Public Lessons</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cookies">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/disclaimer">Disclaimer</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="social-links">
              <a
                href="https://www.facebook.com/md.nayemislam.9693001"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Facebook"
              >
                f
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Twitter"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/nayem-talukdar/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="LinkedIn"
              >
                in
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Instagram"
              >
                📷
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Lessons App. All rights reserved.</p>
          <p className="version">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
