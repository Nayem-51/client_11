import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsAPI } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth";
import "../Pages.css";

const MyFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await lessonsAPI.getAll();
      const allLessons = response.data?.data || response.data || [];

      // Filter lessons that are in user's favorites
      const favoritesList = allLessons.filter(
        (lesson) =>
          lesson.favorites?.includes(user?._id) ||
          user?.savedLessons?.includes(lesson._id)
      );

      setFavorites(favoritesList);
      setError("");
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setError("Failed to load your favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (lessonId) => {
    try {
      await lessonsAPI.removeFavorite(lessonId);
      setFavorites(favorites.filter((l) => l._id !== lessonId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setError("Failed to remove favorite. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="page dashboard-page">
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <h1>My Favorites</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any lessons yet.</p>
          <button
            onClick={() => navigate("/lessons")}
            className="btn btn-primary"
          >
            Browse Lessons
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            {favorites.length} saved lesson{favorites.length !== 1 ? "s" : ""}
          </p>

          <div className="lessons-grid">
            {favorites.map((lesson) => (
              <div key={lesson._id} className="lesson-card">
                <h3>{lesson.title}</h3>
                <p className="lesson-desc">{lesson.description}</p>

                <div className="lesson-card__meta">
                  <span className="pill">{lesson.category || "General"}</span>
                  {lesson.accessLevel === "premium" && (
                    <span
                      className="pill"
                      style={{ background: "#fef3c7", color: "#b45309" }}
                    >
                      Premium
                    </span>
                  )}
                </div>

                <div
                  className="creator-row"
                  style={{ marginTop: "12px", fontSize: "13px" }}
                >
                  <span className="creator-name">
                    {lesson.instructor?.name ||
                      lesson.creator?.name ||
                      "Anonymous"}
                  </span>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                  <div className="table-actions">
                    <button
                      onClick={() => navigate(`/lessons/${lesson._id}`)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      View Lesson
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(lesson._id)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
