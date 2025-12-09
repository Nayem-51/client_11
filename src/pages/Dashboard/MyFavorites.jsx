import React, { useState, useEffect, useMemo } from "react";
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
  const [success, setSuccess] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [toneFilter, setToneFilter] = useState("");

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

  const filteredFavorites = useMemo(() => {
    return favorites.filter((lesson) => {
      const matchesCategory = categoryFilter
        ? (lesson.category || "").toLowerCase() === categoryFilter.toLowerCase()
        : true;
      const matchesTone = toneFilter
        ? (lesson.emotionalTone || "").toLowerCase() === toneFilter.toLowerCase()
        : true;
      return matchesCategory && matchesTone;
    });
  }, [favorites, categoryFilter, toneFilter]);

  const handleRemoveFavorite = async (lessonId) => {
    try {
      await lessonsAPI.removeFavorite(lessonId);
      setFavorites(favorites.filter((l) => l._id !== lessonId));
      setSuccess("Removed from favorites ✓");
      setTimeout(() => setSuccess(""), 3000);
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
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Saved lessons</p>
          <h1>My Favorites</h1>
        </div>
        <button onClick={fetchFavorites} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div
          className="alert"
          style={{ background: "#ecfdf3", color: "#166534", border: "1px solid #bbf7d0" }}
        >
          {success}
        </div>
      )}

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
          <div className="section-with-header" style={{ alignItems: "flex-end" }}>
            <div>
              <p style={{ color: "#6b7280", margin: "0 0 6px 0" }}>
                {favorites.length} saved lesson{favorites.length !== 1 ? "s" : ""}
              </p>
              <h2 style={{ margin: 0 }}>Favorites Library</h2>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ marginBottom: 4 }}>Filter by Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Career">Career</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Spirituality">Spirituality</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ marginBottom: 4 }}>Filter by Tone</label>
                <select
                  value={toneFilter}
                  onChange={(e) => setToneFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Motivational">Motivational</option>
                  <option value="Reflective">Reflective</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Tone</th>
                  <th>Access</th>
                  <th>Visibility</th>
                  <th>Reactions</th>
                  <th>Saves</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFavorites.map((lesson) => (
                  <tr key={lesson._id}>
                    <td>
                      <strong>{lesson.title}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {lesson.description?.slice(0, 60)}
                        {lesson.description?.length > 60 ? "..." : ""}
                      </div>
                    </td>
                    <td>
                      <span className="pill">{lesson.category || "General"}</span>
                    </td>
                    <td>
                      <span className="pill pill-warning" style={{ background: "#eef2ff", color: "#4338ca" }}>
                        {lesson.emotionalTone || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            lesson.accessLevel === "premium" ? "#fef3c7" : "#dbeafe",
                          color:
                            lesson.accessLevel === "premium" ? "#b45309" : "#1e40af",
                        }}
                      >
                        {lesson.accessLevel === "premium" ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            lesson.visibility === "public" ? "#ecfdf3" : "#fee2e2",
                          color:
                            lesson.visibility === "public" ? "#15803d" : "#991b1b",
                        }}
                      >
                        {lesson.visibility === "public" ? "Public" : "Private"}
                      </span>
                    </td>
                    <td>
                      <strong>{lesson.likes?.length || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>reactions</div>
                    </td>
                    <td>
                      <strong>{lesson.favorites?.length || 0}</strong>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>saves</div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => navigate(`/lessons/${lesson._id}`)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(lesson._id)}
                          className="btn btn-danger"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFavorites.length === 0 && (
            <div className="empty-state" style={{ padding: "30px 10px" }}>
              <p>No favorites match the current filters.</p>
              <button
                onClick={() => {
                  setCategoryFilter("");
                  setToneFilter("");
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
