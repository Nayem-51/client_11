import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsAPI } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth";
import { toast, Toaster } from "react-hot-toast";
import "../Pages.css";

const MyFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      toast.error("Failed to load your favorites. Please try again.");
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
        ? (lesson.emotionalTone || "").toLowerCase() ===
          toneFilter.toLowerCase()
        : true;
      return matchesCategory && matchesTone;
    });
  }, [favorites, categoryFilter, toneFilter]);

  const handleRemoveFavorite = async (lessonId) => {
    try {
      await lessonsAPI.removeFavorite(lessonId);
      setFavorites(favorites.filter((l) => l._id !== lessonId));
      toast.success("Removed from favorites ✓");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      toast.error("Failed to remove favorite. Please try again.");
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
      <Toaster position="top-center" reverseOrder={false} />
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Saved lessons</p>
          <h1>My Favorites</h1>
        </div>
        <button onClick={fetchFavorites} className="btn btn-secondary">
          Refresh
        </button>
      </div>

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
          <div
            className="section-with-header"
            style={{ alignItems: "flex-end" }}
          >
            <div>
              <p style={{ color: "#6b7280", margin: "0 0 6px 0" }}>
                {favorites.length} saved lesson
                {favorites.length !== 1 ? "s" : ""}
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
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Career">Career</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Mindset">Mindset</option>
                  <option value="Mistakes Learned">Mistakes Learned</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ marginBottom: 4 }}>Filter by Tone</label>
                <select
                  value={toneFilter}
                  onChange={(e) => setToneFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Motivational">Motivational</option>
                  <option value="Sad">Sad</option>
                  <option value="Realization">Realization</option>
                  <option value="Gratitude">Gratitude</option>
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
                  <th>Creator</th>
                  <th>Access</th>
                  <th>Created</th>
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
                      <span className="pill">
                        {lesson.category || "General"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="pill pill-warning"
                        style={{ background: "#eef2ff", color: "#4338ca" }}
                      >
                        {lesson.emotionalTone || "-"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="creator-avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                          {lesson.instructor?.photoURL || lesson.creator?.photoURL ? (
                            <img 
                              src={lesson.instructor?.photoURL || lesson.creator?.photoURL} 
                              alt={lesson.instructor?.displayName || lesson.creator?.name || "Creator"} 
                            />
                          ) : (
                            (lesson.instructor?.displayName || lesson.creator?.name || "U")[0]
                          )}
                        </div>
                        <span style={{ fontSize: "13px" }}>
                          {lesson.instructor?.displayName || lesson.creator?.name || "Creator"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
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
                        }}
                      >
                        {lesson.accessLevel === "premium" ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td>
                      {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => navigate(`/lessons/${lesson._id}`)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          See Details
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
