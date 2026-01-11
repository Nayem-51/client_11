import React, { useState } from "react";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page contact-page">
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Get in Touch</p>
            <h1>Contact Us</h1>
            <p className="section-subtitle">
              Have a question, suggestion, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="card contact-card">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row header-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{ borderColor: errors.name ? "var(--danger)" : "var(--border-light)" }}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ borderColor: errors.email ? "var(--danger)" : "var(--border-light)" }}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{ borderColor: errors.subject ? "var(--danger)" : "var(--border-light)" }}
                  >
                    <option value="">Select a subject...</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className="form-textarea"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    style={{ borderColor: errors.message ? "var(--danger)" : "var(--border-light)" }}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="spinner-wrapper">
                        <span className="spinner-sm"></span>
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted">
                Or email us directly at <a href="mailto:support@digitallifelessons.com">support@digitallifelessons.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
