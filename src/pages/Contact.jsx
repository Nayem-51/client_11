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
            <div className="card p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="text-sm font-bold mb-4 block" style={{marginBottom: "0.5rem"}}>Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ borderColor: errors.name ? "var(--danger)" : "var(--border-light)" }}
                  />
                  {errors.name && <span className="text-xs" style={{ color: "var(--danger)", fontSize: "0.80rem", marginTop: "0.25rem", display: "block" }}>{errors.name}</span>}
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-bold block" style={{marginBottom: "0.5rem"}}>Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ borderColor: errors.email ? "var(--danger)" : "var(--border-light)" }}
                  />
                  {errors.email && <span className="text-xs" style={{ color: "var(--danger)", fontSize: "0.80rem", marginTop: "0.25rem", display: "block" }}>{errors.email}</span>}
                </div>

                <div>
                  <label htmlFor="subject" className="text-sm font-bold block" style={{marginBottom: "0.5rem"}}>Subject</label>
                  <select
                    id="subject"
                    name="subject"
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
                  {errors.subject && <span className="text-xs" style={{ color: "var(--danger)", fontSize: "0.80rem", marginTop: "0.25rem", display: "block" }}>{errors.subject}</span>}
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-bold block" style={{marginBottom: "0.5rem"}}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    style={{ borderColor: errors.message ? "var(--danger)" : "var(--border-light)" }}
                  ></textarea>
                  {errors.message && <span className="text-xs" style={{ color: "var(--danger)", fontSize: "0.80rem", marginTop: "0.25rem", display: "block" }}>{errors.message}</span>}
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%" }}>
                    {isSubmitting ? (
                      <>
                        <div className="spinner" style={{ width: "16px", height: "16px", borderTopColor: "white", borderWidth: "2px" }}></div>
                        Sending...
                      </>
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
