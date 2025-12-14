import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsAPI } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth";
import "../Pages.css";

const AddLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Personal Growth",
    emotionalTone: "Motivational",
    image: "",
    privacy: "public",
    accessLevel: "free",
    content: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    // Validation
    if (!formData.title.trim()) {
      showToast("Please enter a lesson title", "error");
      return;
    }

    if (!formData.description.trim()) {
      showToast("Please enter a lesson description", "error");
      return;
    }

    if (!user?.isPremium && formData.accessLevel === "premium") {
      showToast("Only premium users can create premium lessons", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: "beginner",
        price: formData.accessLevel === "premium" ? 9.99 : 0,
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        duration: 30,
        content: formData.content,
        emotionalTone: formData.emotionalTone,
        isPublished: formData.privacy === "public",
        isPremium: formData.accessLevel === "premium",
        tags: [formData.category, formData.emotionalTone],
      };

      await lessonsAPI.create(payload);
      showToast("Lesson created successfully!", "success");

      setTimeout(() => {
        navigate("/dashboard/my-lessons");
      }, 2000);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create lesson",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page add-lesson-page">
      <div className="form-header">
        <div>
          <p className="eyebrow">New Content</p>
          <h1>Create a Life Lesson</h1>
          <p className="section-subtitle">
            Share your wisdom and insights with the community
          </p>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <form onSubmit={handleSubmit} className="lesson-form">
        <div className="form-section">
          <h3>Lesson Details</h3>

          <div className="form-group">
            <label htmlFor="title">Lesson Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., How I Overcame My Fears"
              maxLength={120}
            />
            <p className="form-hint">{formData.title.length}/120</p>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Short Summary) *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief overview of your lesson (150 chars)"
              maxLength={150}
              rows={3}
            />
            <p className="form-hint">{formData.description.length}/150</p>
          </div>

          <div className="form-group">
            <label htmlFor="content">Full Content / Story / Insight</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share the full story, details, and insights..."
              rows={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Featured Image URL</label>
            <input
              id="image"
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="form-hint">
              Optional: Add a cover image for your lesson
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3>Categorization</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Personal Growth">Personal Growth</option>
                <option value="Career">Career</option>
                <option value="Relationships">Relationships</option>
                <option value="Mindset">Mindset</option>
                <option value="Mistakes Learned">Mistakes Learned</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="emotionalTone">Emotional Tone *</label>
              <select
                id="emotionalTone"
                name="emotionalTone"
                value={formData.emotionalTone}
                onChange={handleChange}
              >
                <option value="Motivational">Motivational</option>
                <option value="Sad">Sad</option>
                <option value="Realization">Realization</option>
                <option value="Gratitude">Gratitude</option>
                <option value="Humorous">Humorous</option>
                <option value="Inspirational">Inspirational</option>
                <option value="Balanced">Balanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Privacy & Access</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="privacy">Visibility *</label>
              <select
                id="privacy"
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
              >
                <option value="public">Public (Everyone can see)</option>
                <option value="private">Private (Only you)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="accessLevel">
                Access Level *
                {!user?.isPremium && (
                  <span className="premium-badge" title="Upgrade to Premium">
                    🔒
                  </span>
                )}
              </label>
              <select
                id="accessLevel"
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleChange}
                disabled={!user?.isPremium}
              >
                <option value="free">Free</option>
                {user?.isPremium && (
                  <option value="premium">Premium Only</option>
                )}
              </select>
              {!user?.isPremium && formData.accessLevel === "free" && (
                <p className="form-hint">
                  💡 Upgrade to Premium to create exclusive paid lessons
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLesson;
