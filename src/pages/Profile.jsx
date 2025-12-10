import React, { useEffect, useMemo, useState } from "react";
import { lessonsAPI, userAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import { toast, Toaster } from "react-hot-toast";
import "./Pages.css";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    displayName: "",
    photoURL: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || user.name || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await lessonsAPI.getAll();
        const allLessons = response.data?.data || response.data || [];

        const userLessons = allLessons
          .filter(
            (l) =>
              (l.instructor?._id === user?._id ||
                l.creator?._id === user?._id) &&
              (l.visibility || "public") === "public"
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setLessons(userLessons);
      } catch (err) {
        console.error("Failed to fetch profile lessons:", err);
        toast.error("Failed to load your lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [user]);

  const lessonsCreatedCount = lessons.length;
  const lessonsSavedCount = user?.savedLessons?.length || 0;

  const avatar = useMemo(() => {
    if (form.photoURL) return form.photoURL;
    if (user?.photoURL) return user.photoURL;
    return "";
  }, [form.photoURL, user?.photoURL]);

  const initials = (user?.displayName || user?.name || user?.email || "U")
    .slice(0, 2)
    .toUpperCase();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }

    try {
      setUpdating(true);
      await userAPI.updateProfile({
        displayName: form.displayName.trim(),
        photoURL: form.photoURL.trim(),
      });
      await refreshUser();
      toast.success("Profile updated successfully! ✓");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="page profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div
      className="page profile-page"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="dashboard-header" style={{ alignItems: "center" }}>
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Profile</h1>
        </div>
        {user.isPremium && (
          <span
            className="pill"
            style={{ background: "#fef3c7", color: "#b45309" }}
          >
            Premium ⭐
          </span>
        )}
      </div>

      <div
        className="profile-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left: user info + stats */}
        <div
          className="lesson-card"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#eef2ff",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.displayName || user.name || "User avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span style={{ fontWeight: 700, color: "#4338ca" }}>
                  {initials}
                </span>
              )}
            </div>
            <div>
              <h2 style={{ margin: "0 0 4px 0" }}>
                {user.displayName || user.name || "Your name"}
              </h2>
              <p style={{ margin: 0, color: "#6b7280" }}>{user.email}</p>
              {user.isPremium ? (
                <span
                  className="badge"
                  style={{
                    background: "#ecfdf3",
                    color: "#15803d",
                    marginTop: 6,
                  }}
                >
                  Premium ⭐
                </span>
              ) : (
                <span
                  className="badge"
                  style={{
                    background: "#eef2ff",
                    color: "#4338ca",
                    marginTop: 6,
                  }}
                >
                  Free plan
                </span>
              )}
            </div>
          </div>

          <div
            className="stats-grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
          >
            <div className="stat-box">
              <p className="stat-box__label">Lessons created</p>
              <p className="stat-box__value">{lessonsCreatedCount}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Lessons saved</p>
              <p className="stat-box__value">{lessonsSavedCount}</p>
            </div>
          </div>
        </div>

        {/* Right: update form */}
        <div className="lesson-card">
          <h3 style={{ marginTop: 0 }}>Update Profile</h3>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                disabled={updating}
                required
              />
            </div>

            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="url"
                value={form.photoURL}
                onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                disabled={updating}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
              <p className="form-group__hint">
                Email cannot be edited for security.
              </p>
            </div>

            <div
              className="form-actions"
              style={{ justifyContent: "flex-start" }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lessons list */}
      <div className="dashboard-section">
        <div className="section-with-header">
          <h2>Your public lessons</h2>
          <p style={{ margin: 0, color: "#6b7280" }}>Sorted by newest first</p>
        </div>

        {loading ? (
          <p>Loading lessons...</p>
        ) : lessons.length === 0 ? (
          <div className="empty-state" style={{ padding: "30px 10px" }}>
            <p>You have no public lessons yet.</p>
          </div>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="lesson-card">
                <div className="lesson-card__top">
                  <h3 style={{ margin: 0 }}>{lesson.title}</h3>
                  <span className="pill">{lesson.category || "General"}</span>
                </div>
                <p className="lesson-desc">{lesson.description}</p>
                <div className="lesson-card__meta">
                  <span
                    className="pill"
                    style={{ background: "#eef2ff", color: "#4338ca" }}
                  >
                    {lesson.emotionalTone || "Reflective"}
                  </span>
                  <span className="pill pill-accent">
                    {lesson.accessLevel === "premium" ? "Premium" : "Free"}
                  </span>
                </div>
                <div className="lesson-meta-line">
                  <span className="creator-name">
                    {lesson.instructor?.name || lesson.creator?.name || "You"}
                  </span>
                  <span className="muted">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="lesson-meta-line">
                  <span className="muted">
                    {lesson.likes?.length || 0} reactions
                  </span>
                  <span className="muted">
                    {lesson.favorites?.length || 0} saves
                  </span>
                </div>
                <div className="lesson-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      window.open(`/lessons/${lesson._id}`, "_self")
                    }
                  >
                    View lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
