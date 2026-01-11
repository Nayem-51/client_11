import React from "react";
import { Link } from "react-router-dom";

const Legal = () => {
  return (
    <div className="page legal-page">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Legal</p>
            <h1>Terms & Privacy</h1>
          </div>

          <div className="legal-container">
            <div className="card p-8">
              <h3 className="legal-heading">Legal Disclaimer</h3>
              <p className="text-muted mb-4">
                This is a demonstration project created for educational purposes. It is not a real commercial service. All "lessons" and content provided are for demonstration only.
              </p>
              
              <div className="divider"></div>

              <h3 className="legal-heading">Privacy Policy</h3>
              <p className="text-muted mb-4">
                We value your privacy. As a demo platform:
              </p>
              <ul className="legal-list">
                <li>We do not sell your personal data.</li>
                <li>We use cookies only for essential authentication purposes.</li>
                <li>Any data you enter is stored in a test database and may be wiped periodically.</li>
              </ul>

              <div className="divider"></div>

              <h3 className="legal-heading">Terms of Service</h3>
              <p className="text-muted mb-4">
                By accessing this platform, you agree to:
              </p>
              <ul className="legal-list">
                <li>Be respectful to other community members.</li>
                <li>Not post harmful or offensive content.</li>
                <li>Understand that this is a portfolio project found at <a href="https://github.com/yourusername" className="text-link">GitHub</a>.</li>
              </ul>

              <div className="mt-8 pt-4 border-t border-light flex justify-center">
                <Link to="/" className="btn btn-secondary">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;
