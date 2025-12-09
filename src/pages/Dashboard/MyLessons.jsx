import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsAPI } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth";
import "../Pages.css";

const MyLessons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      setError("");
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
      setError("Failed to load your lessons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    try {
      await lessonsAPI.delete(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setError("Failed to delete lesson. Please try again.");
    }
  };

  const handleEdit = (lessonId) => {
    navigate(`/dashboard/edit-lesson/${lessonId}`);
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
      <div className="dashboard-header">
        <h1>My Lessons</h1>
        <button
          onClick={() => navigate("/dashboard/add-lesson")}
          className="btn btn-primary"
        >
          + Create New Lesson
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

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

          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="lesson-card">
                <h3>{lesson.title}</h3>
                <p className="lesson-desc">{lesson.description}</p>

                <div className="lesson-card__meta">
                  <span className="pill">{lesson.category || "General"}</span>
                  <span className="pill pill-accent">
                    {lesson.accessLevel === "premium" ? "Premium" : "Free"}
                  </span>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(lesson._id)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(lesson._id)}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {deleteConfirm === lesson._id && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "#fee2e2",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ margin: "0 0 10px 0", color: "#991b1b" }}>
                      Are you sure?
                    </p>
                    <div className="table-actions">
                      <button
                        onClick={() => handleDelete(lesson._id)}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLessons;
