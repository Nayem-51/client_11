import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsAPI } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth";
import { toast, Toaster } from "react-hot-toast";
import "../Pages.css";

const MyLessons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    emotionalTone: "",
    visibility: "public",
    accessLevel: "free",
    featuredImage: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMyLessons();
  }, [user]);

  const fetchMyLessons = async () => {
    try {
      setLoading(true);
      const response = await lessonsAPI.getAll();
      const allLessons = response.data?.data || response.data || [];

      // Filter lessons created by current user
      const userLessons = allLessons.filter(
        (l) => l.instructor?._id === user?._id || l.creator?._id === user?._id
      );

      setLessons(userLessons);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
      toast.error("Failed to load your lessons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (lesson) => {
    setEditForm({
      title: lesson.title,
      description: lesson.description,
      category: lesson.category || "",
      emotionalTone: lesson.emotionalTone || "",
      visibility: lesson.visibility || "public",
      accessLevel: lesson.accessLevel || "free",
      featuredImage: lesson.featuredImage || "",
    });
    setEditModal(lesson._id);
  };

  const handleUpdate = async (lessonId) => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setUpdating(true);
      await lessonsAPI.update(lessonId, editForm);

      // Update local state
      setLessons(
        lessons.map((l) => (l._id === lessonId ? { ...l, ...editForm } : l))
      );

      toast.success("Lesson updated successfully! ✓");
      setEditModal(null);
    } catch (err) {
      console.error("Failed to update lesson:", err);
      toast.error("Failed to update lesson. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (lessonId) => {
    try {
      await lessonsAPI.delete(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      setDeleteConfirm(null);
      toast.success("Lesson deleted successfully! ✓");
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      toast.error("Failed to delete lesson. Please try again.");
    }
  };

  const handleToggleVisibility = async (lesson) => {
    const newVisibility = lesson.visibility === "public" ? "private" : "public";
    try {
      await lessonsAPI.update(lesson._id, {
        ...lesson,
        visibility: newVisibility,
      });
      setLessons(
        lessons.map((l) =>
          l._id === lesson._id ? { ...l, visibility: newVisibility } : l
        )
      );
      toast.success(`Lesson is now ${newVisibility}! ✓`);
    } catch (err) {
      toast.error("Failed to update visibility.");
    }
  };

  const handleToggleAccessLevel = async (lesson) => {
    if (!user?.isPremium && lesson.accessLevel === "free") {
      toast.error(
        "You need an active Premium subscription to set premium access level."
      );
      return;
    }

    const newAccessLevel =
      lesson.accessLevel === "premium" ? "free" : "premium";
    try {
      await lessonsAPI.update(lesson._id, {
        ...lesson,
        accessLevel: newAccessLevel,
      });
      setLessons(
        lessons.map((l) =>
          l._id === lesson._id ? { ...l, accessLevel: newAccessLevel } : l
        )
      );
      toast.success(`Access level changed to ${newAccessLevel}! ✓`);
    } catch (err) {
      toast.error("Failed to update access level.");
    }
  };

  if (loading) {
    return (
      <div className="page dashboard-page">
        <p>Loading your lessons...</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="dashboard-header">
        <h1>My Lessons</h1>
        <button
          onClick={() => navigate("/dashboard/add-lesson")}
          className="btn btn-primary"
        >
          + Create New Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any lessons yet.</p>
          <button
            onClick={() => navigate("/dashboard/add-lesson")}
            className="btn btn-primary"
          >
            Create Your First Lesson
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </p>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Visibility</th>
                  <th>Access Level</th>
                  <th>Reactions</th>
                  <th>Saves</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson._id}>
                    <td>
                      <strong>{lesson.title}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {lesson.description?.slice(0, 50)}
                        {lesson.description?.length > 50 ? "..." : ""}
                      </div>
                    </td>
                    <td>
                      <span className="pill">
                        {lesson.category || "General"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleVisibility(lesson)}
                        className="badge"
                        style={{
                          background:
                            lesson.visibility === "public"
                              ? "#ecfdf3"
                              : "#fee2e2",
                          color:
                            lesson.visibility === "public"
                              ? "#15803d"
                              : "#991b1b",
                          cursor: "pointer",
                          border: "none",
                          padding: "6px 12px",
                        }}
                      >
                        {lesson.visibility === "public" ? "Public" : "Private"}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleAccessLevel(lesson)}
                        className="badge"
                        style={{
                          background:
                            lesson.accessLevel === "premium"
                              ? "#fef3c7"
                              : "#dbeafe",
                          color:
                            lesson.accessLevel === "premium"
                              ? "#b45309"
                              : "#1e40af",
                          cursor: user?.isPremium ? "pointer" : "not-allowed",
                          opacity: user?.isPremium ? 1 : 0.6,
                          border: "none",
                          padding: "6px 12px",
                        }}
                        disabled={
                          !user?.isPremium && lesson.accessLevel === "free"
                        }
                        title={
                          !user?.isPremium
                            ? "Premium subscription required"
                            : "Click to toggle"
                        }
                      >
                        {lesson.accessLevel === "premium" ? "Premium" : "Free"}
                      </button>
                    </td>
                    <td>
                      <strong>{lesson.likes?.length || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        reactions
                      </div>
                    </td>
                    <td>
                      <strong>{lesson.favorites?.length || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        saves
                      </div>
                    </td>
                    <td>{new Date(lesson.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => navigate(`/lessons/${lesson._id}`)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="View lesson details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(lesson)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="Edit lesson"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(lesson._id)}
                          className="btn btn-danger"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="Delete lesson"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {editModal && (
        <div
          className="modal-backdrop"
          onClick={() => !updating && setEditModal(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <h2 style={{ margin: "0 0 20px 0" }}>Edit Lesson</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(editModal);
              }}
            >
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  disabled={updating}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  disabled={updating}
                  required
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    disabled={updating}
                  >
                    <option value="">Select category</option>
                    <option value="Career">Career</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Spirituality">Spirituality</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Emotional Tone</label>
                  <select
                    value={editForm.emotionalTone}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        emotionalTone: e.target.value,
                      })
                    }
                    disabled={updating}
                  >
                    <option value="">Select tone</option>
                    <option value="Inspirational">Inspirational</option>
                    <option value="Motivational">Motivational</option>
                    <option value="Reflective">Reflective</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label>Visibility</label>
                  <select
                    value={editForm.visibility}
                    onChange={(e) =>
                      setEditForm({ ...editForm, visibility: e.target.value })
                    }
                    disabled={updating}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Access Level</label>
                  <select
                    value={editForm.accessLevel}
                    onChange={(e) =>
                      setEditForm({ ...editForm, accessLevel: e.target.value })
                    }
                    disabled={updating || !user?.isPremium}
                    title={
                      !user?.isPremium ? "Premium subscription required" : ""
                    }
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                  {!user?.isPremium && editForm.accessLevel === "premium" && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#b45309",
                        margin: "6px 0 0 0",
                      }}
                    >
                      ⚠️ Premium subscription required
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Featured Image URL (optional)</label>
                <input
                  type="url"
                  value={editForm.featuredImage}
                  onChange={(e) =>
                    setEditForm({ ...editForm, featuredImage: e.target.value })
                  }
                  disabled={updating}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Lesson"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="btn btn-secondary"
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 16px 0", color: "#991b1b" }}>
              Delete Lesson?
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              This action cannot be undone. The lesson will be permanently
              removed from the database.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLessons;
