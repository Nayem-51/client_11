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

          <div className="card p-6" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h3>Legal Information</h3>
            <p>
              This is a demonstration project. In a real application, this page would contain the full text of our Terms of Service, Privacy Policy, Cookie Policy, and Disclaimer.
            </p>
            <p>
              <strong>Privacy Policy:</strong> We value your privacy and do not sell your data.
            </p>
            <p>
              <strong>Terms of Service:</strong> By using this site, you agree to be kind and respectful to other learners.
            </p>
            <div className="mt-4">
              <Link to="/" className="btn btn-secondary">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;
