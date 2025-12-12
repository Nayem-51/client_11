import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI, userAPI, adminAPI } from "../../../api/endpoints";
import { useAuth } from "../../../hooks/useAuth";
import Spinner from "../../../components/common/Spinner";
import { toast, Toaster } from "react-hot-toast";
import "../../Pages.css";

const deriveVisibility = (lesson) => {
  if (lesson?.accessLevel === "premium" || lesson?.isPremium) return "Premium";
  if (
    lesson?.isPublic ||
    lesson?.isPublished ||
    lesson?.visibility === "public"
  )
    return "Public";
  return "Private";
};

const isFlagged = (lesson) =>
  Boolean(
    lesson?.isFlagged ||
      lesson?.status === "flagged" ||
      (lesson?.reportCount || 0) > 0 ||
      (Array.isArray(lesson?.reports) && lesson.reports.length > 0)
  );

const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", photoURL: "" });
  const [updating, setUpdating] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", photoURL: user.photoURL || "" });
    }
  }, [user]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await adminAPI.getLessons();
        const data = res.data?.data || [];
        setLessons(data);
      } catch (err) {
        console.error("Failed to load admin lessons", err);
        toast.error("Failed to load platform lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [user]);

  const stats = useMemo(() => {
    const publicLessons = lessons.filter(
      (l) => l.isPublic || l.isPublished || l.visibility === "public"
    ).length;
    const privateLessons = lessons.filter(
      (l) => !l.isPublic && !l.isPublished
    ).length;
    const flaggedLessons = lessons.filter((l) => isFlagged(l)).length;
    const featuredLessons = lessons.filter((l) => l.isFeatured).length;
    return { publicLessons, privateLessons, flaggedLessons, featuredLessons };
  }, [lessons]);

  const recentLessons = useMemo(
    () =>
      lessons
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [lessons]
  );

  const avatar = useMemo(() => {
    if (avatarError) return "";
    if (form.photoURL) return form.photoURL;
    if (user?.photoURL) return user.photoURL;
    return "";
  }, [avatarError, form.photoURL, user?.photoURL]);

  const initials = (user?.name || user?.email || "A").slice(0, 2).toUpperCase();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Display name is required.");
      return;
    }
    try {
      setUpdating(true);
      await userAPI.updateProfile({
        displayName: form.name.trim(),
        photoURL: form.photoURL.trim(),
      });
      await refreshUser();
      toast.success("Profile updated successfully. ✓");
    } catch (err) {
      console.error("Failed to update admin profile", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="page admin-page">
        <Spinner label="Loading admin profile..." />
      </div>
    );
  }

  return (
    <div
      className="page admin-page"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="admin-header" style={{ alignItems: "center" }}>
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Admin Profile</h1>
          <p className="muted">
            Manage your admin identity and keep your details current.
          </p>
        </div>
        <div className="admin-actions">
          <span className="badge badge-success">Admin</span>
          <Link to="/dashboard/admin" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        <div className="dashboard-card" style={{ gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 76,
                height: 76,
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
                  alt={user.name || "Admin avatar"}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setAvatarError(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontWeight: 700, color: "#4338ca" }}>
                  {initials}
                </span>
              )}
            </div>
            <div>
              <h2 style={{ margin: "0 0 4px 0" }}>{user.name || "Admin"}</h2>
              <p className="muted" style={{ margin: 0 }}>
                {user.email}
              </p>
            </div>
          </div>

          <div
            className="stats-grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
          >
            <div className="stat-box">
              <p className="stat-box__label">Public lessons</p>
              <p className="stat-box__value">{stats.publicLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Flagged content</p>
              <p className="stat-box__value">{stats.flaggedLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Private/draft</p>
              <p className="stat-box__value">{stats.privateLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Featured</p>
              <p className="stat-box__value">{stats.featuredLessons}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Profile</p>
              <h3>Update Details</h3>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Activity</p>
            <h3>Moderation Snapshot</h3>
          </div>
          <div className="admin-actions">
            <Link
              to="/dashboard/admin/manage-lessons"
              className="btn btn-secondary"
            >
              Manage Lessons
            </Link>
            <Link
              to="/dashboard/admin/reported-lessons"
              className="btn btn-secondary"
            >
              Reported Lessons
            </Link>
          </div>
        </div>
        {loading ? (
          <Spinner label="Loading moderation data..." />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Visibility</th>
                  <th>Flags</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentLessons.map((lesson) => (
                  <tr key={lesson._id}>
                    <td>{lesson.title}</td>
                    <td>{deriveVisibility(lesson)}</td>
                    <td>{isFlagged(lesson) ? lesson.reportCount || 1 : 0}</td>
                    <td>
                      {lesson.createdAt
                        ? new Date(lesson.createdAt).toLocaleDateString()
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
