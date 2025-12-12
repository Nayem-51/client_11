import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI, lessonsAPI } from "../../../api/endpoints";
import Spinner from "../../../components/common/Spinner";
import { toast, Toaster } from "react-hot-toast";
import "../../Pages.css";

const deriveVisibility = (lesson) => {
  // Logic: 
  // 1. If not published -> Draft
  // 2. If premium access -> Premium
  // 3. If visibility private -> Private
  // 4. Else -> Public
  if (lesson.isPublished === false) return "Draft";
  if (lesson.accessLevel === "premium") return "Premium";
  if (lesson.visibility === "private") return "Private";
  return "Public";
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [flaggedFilter, setFlaggedFilter] = useState("all");

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLessons({ limit: 100 });
      const data = res.data?.data || [];
      setLessons(data);
    } catch (err) {
      console.error("Admin manage lessons fetch failed", err);
      toast.error("Failed to load lessons. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const stats = useMemo(() => {
    const publicLessons = lessons.filter(
      (l) => l.isPublished && (l.visibility === "public")
    ).length;
    const privateLessons = lessons.filter(
      (l) => l.isPublished && (l.visibility === "private")
    ).length;
    const draftLessons = lessons.filter(l => l.isPublished === false).length;
    const flaggedLessons = lessons.filter((l) => isFlagged(l)).length;
    return { publicLessons, privateLessons, draftLessons, flaggedLessons };
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
        visibility.toLowerCase() === visibilityFilter.toLowerCase();
      
      const flaggedMatch =
        flaggedFilter === "all" ||
        (flaggedFilter === "flagged" ? isFlagged(lesson) : !isFlagged(lesson));
      
      return titleMatch && categoryMatch && visibilityMatch && flaggedMatch;
    });
  }, [categoryFilter, flaggedFilter, lessons, search, visibilityFilter]);

  const handleDelete = async (id) => {
    const target = lessons.find((l) => l._id === id);
    if (
      !window.confirm(
        `Delete lesson "${
          target?.title || "this lesson"
        }"? This cannot be undone.`
      )
    ) {
      return;
    }
    
    try {
      await lessonsAPI.delete(id);
      setLessons((prev) => prev.filter((lesson) => lesson._id !== id));
      toast.success("Lesson deleted successfully. ✓");
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      toast.error("Failed to delete lesson.");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await lessonsAPI.toggleFeature(id);
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson._id === id
            ? { ...lesson, isFeatured: !lesson.isFeatured }
            : lesson
        )
      );
      toast.success("Lesson featured status updated.");
    } catch (err) {
      console.error("Failed to toggle feature:", err);
      toast.error("Failed to update featured status");
    }
  };

  const markReviewed = async (id) => {
    try {
        // Use standard update endpoint since current user is admin
        await lessonsAPI.update(id, { isReviewed: true, isFlagged: false, reportCount: 0 });
        
        setLessons((prev) =>
        prev.map((lesson) =>
            lesson._id === id
            ? { ...lesson, isReviewed: true, isFlagged: false, reportCount: 0 }
            : lesson
        )
        );
        toast.success("Lesson marked as reviewed.");
    } catch (err) {
        toast.error("Failed to mark as reviewed");
    }
  };

  return (
    <div className="page admin-page">
      <Toaster position="top-center" reverseOrder={false} />
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

      <div className="stats-section">
        <div className="stat-box">
          <p className="stat-label">Public</p>
          <p className="stat-value">{stats.publicLessons}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Private</p>
          <p className="stat-value">{stats.privateLessons}</p>
        </div>
         <div className="stat-box">
          <p className="stat-label">Drafts</p>
          <p className="stat-value">{stats.draftLessons}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Flagged</p>
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
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
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
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="all">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="premium">Premium</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={flaggedFilter}
              onChange={(e) => setFlaggedFilter(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
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
          <Spinner label="Loading lessons..." />
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
                    <td>
                         <span className={`badge ${
                             lesson.isPublished === false ? 'badge-neutral' : 
                             lesson.visibility === 'public' ? 'badge-success' : 'badge-warning'
                         }`}>
                             {deriveVisibility(lesson)}
                         </span>
                    </td>
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
                          style={{padding: '4px 8px'}}
                        >
                          {lesson.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          className="btn"
                          onClick={() => markReviewed(lesson._id)}
                          style={{padding: '4px 8px'}}
                          disabled={lesson.isReviewed}
                        >
                          {lesson.isReviewed ? "Reviewed" : "Review"}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(lesson._id)}
                          style={{padding: '4px 8px'}}
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
