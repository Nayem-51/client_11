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
    <div className="page admin-page flex-col gap-6">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header */}
      <div className="admin-header">
        <div>
          <span className="eyebrow">Administrator</span>
          <h1>Admin Profile</h1>
          <p className="text-muted mb-0">
            Manage your admin identity and keep your details current.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="badge badge-success">Admin Role</span>
          <Link to="/dashboard/admin" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Identity Card */}
        <div className="dashboard-card gap-6">
          <div className="flex items-center gap-4">
            <div className="creator-avatar" style={{ width: 80, height: 80, fontSize: '1.5rem' }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-xl mb-1">{user.name || "Admin"}</h2>
              <p className="text-muted m-0">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="stat-box">
              <p className="stat-box__label">Public</p>
              <p className="stat-box__value">{stats.publicLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Flagged</p>
              <p className="stat-box__value">{stats.flaggedLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Private</p>
              <p className="stat-box__value">{stats.privateLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-box__label">Featured</p>
              <p className="stat-box__value">{stats.featuredLessons}</p>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="dashboard-card">
          <div className="mb-4">
            <span className="eyebrow">Profile settings</span>
            <h3>Update Details</h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="flex-col gap-4">
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
              <label>Email Address</label>
              <input type="email" value={user.email} disabled className="bg-subtle cursor-not-allowed opacity-75" />
              <p className="text-sm text-muted mt-2">
                Email cannot be edited for security reasons.
              </p>
            </div>
            
            <div className="mt-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Activity Section */}
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <span className="eyebrow">Recent Activity</span>
            <h3>Moderation Snapshot</h3>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/admin/manage-lessons"
              className="btn btn-secondary text-sm"
            >
              Manage Lessons
            </Link>
            <Link
              to="/dashboard/admin/reported-lessons"
              className="btn btn-secondary text-sm"
            >
              Reported
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
                  <th>Lesson Title</th>
                  <th>Status</th>
                  <th>Reports</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {recentLessons.map((lesson) => (
                  <tr key={lesson._id}>
                    <td className="font-bold">{lesson.title}</td>
                    <td>
                      <span className={`badge ${isFlagged(lesson) ? 'badge-danger' : 'badge-success'}`}>
                         {deriveVisibility(lesson)}
                      </span>
                    </td>
                    <td>
                      {isFlagged(lesson) ? (
                         <span className="text-danger font-bold">{lesson.reportCount || 1} Reports</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {lesson.createdAt
                        ? new Date(lesson.createdAt).toLocaleDateString()
                        : "--"}
                    </td>
                  </tr>
                ))}
                {recentLessons.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-6 text-muted">
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
