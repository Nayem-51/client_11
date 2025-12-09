import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../../../api/endpoints";
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

const ManageLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [flaggedFilter, setFlaggedFilter] = useState("all");

  const fetchLessons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await lessonsAPI.getAll();
      const data = res.data?.data || res.data || [];
      setLessons(data);
    } catch (err) {
      setError("Failed to load lessons. Please retry.");
      console.error("Admin manage lessons fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const stats = useMemo(() => {
    const publicLessons = lessons.filter(
      (l) => l.isPublic || l.isPublished || l.visibility === "public"
    ).length;
    const privateLessons = lessons.filter(
      (l) => !l.isPublic && !l.isPublished
    ).length;
    const flaggedLessons = lessons.filter((l) => isFlagged(l)).length;
    return { publicLessons, privateLessons, flaggedLessons };
  }, [lessons]);

  const categories = useMemo(() => {
    const set = new Set();
    lessons.forEach((l) => l.category && set.add(l.category));
    return Array.from(set);
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const titleMatch = lesson.title
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const categoryMatch =
        categoryFilter === "all" || lesson.category === categoryFilter;
      const visibility = deriveVisibility(lesson);
      const visibilityMatch =
        visibilityFilter === "all" ||
        visibility.toLowerCase() === visibilityFilter;
      const flaggedMatch =
        flaggedFilter === "all" ||
        (flaggedFilter === "flagged" ? isFlagged(lesson) : !isFlagged(lesson));
      return titleMatch && categoryMatch && visibilityMatch && flaggedMatch;
    });
  }, [categoryFilter, flaggedFilter, lessons, search, visibilityFilter]);

  const handleDelete = (id) => {
    const target = lessons.find((l) => l._id === id);
    if (
      !window.confirm(
        `Delete lesson "${
          target?.title || "this lesson"
        }"? This cannot be undone here.`
      )
    ) {
      return;
    }
    setLessons((prev) => prev.filter((lesson) => lesson._id !== id));
  };

  const toggleFeatured = (id) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson._id === id
          ? { ...lesson, isFeatured: !lesson.isFeatured }
          : lesson
      )
    );
  };

  const markReviewed = (id) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson._id === id
          ? { ...lesson, isReviewed: true, isFlagged: false, reportCount: 0 }
          : lesson
      )
    );
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin Control</p>
          <h1>Manage Lessons</h1>
          <p className="muted">
            Moderate lessons across the platform — feature, review, or remove.
          </p>
        </div>
        <div className="admin-actions">
          <button className="btn" onClick={fetchLessons} disabled={loading}>
            Refresh
          </button>
          <Link to="/dashboard/admin" className="btn btn-secondary">
            Back to Admin
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-section">
        <div className="stat-box">
          <p className="stat-label">Public Lessons</p>
          <p className="stat-value">{stats.publicLessons}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Private / Draft</p>
          <p className="stat-value">{stats.privateLessons}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Flagged Content</p>
          <p className="stat-value">{stats.flaggedLessons}</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">All Lessons</p>
            <h3>Moderate Content</h3>
          </div>
          <div className="admin-actions">
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="all">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={flaggedFilter}
              onChange={(e) => setFlaggedFilter(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="all">All</option>
              <option value="flagged">Flagged only</option>
              <option value="clean">Unflagged only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading lessons...</p>
        ) : filteredLessons.length === 0 ? (
          <p className="muted">No lessons match your filters.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Visibility</th>
                  <th>Flags</th>
                  <th>Featured</th>
                  <th>Reviewed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => (
                  <tr key={lesson._id}>
                    <td>{lesson.title}</td>
                    <td>{lesson.category || "General"}</td>
                    <td>{deriveVisibility(lesson)}</td>
                    <td>
                      {isFlagged(lesson) ? (
                        <span className="badge badge-danger">
                          {lesson.reportCount || 1} Flags
                        </span>
                      ) : (
                        <span className="badge">Clear</span>
                      )}
                    </td>
                    <td>
                      {lesson.isFeatured ? (
                        <span className="badge badge-success">Featured</span>
                      ) : (
                        <span className="badge badge-warning">
                          Not featured
                        </span>
                      )}
                    </td>
                    <td>
                      {lesson.isReviewed ? (
                        <span className="badge badge-success">Reviewed</span>
                      ) : (
                        <span className="badge">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => toggleFeatured(lesson._id)}
                        >
                          {lesson.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          className="btn"
                          onClick={() => markReviewed(lesson._id)}
                        >
                          Mark Reviewed
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(lesson._id)}
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
        )}
      </div>
    </div>
  );
};

export default ManageLessons;
