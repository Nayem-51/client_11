import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/common/Spinner";
import { toast, Toaster } from "react-hot-toast";
import "./Pages.css";

const CATEGORIES = [
  "Personal Growth",
  "Career",
  "Relationships",
  "Mindset",
  "Mistakes Learned",
  "Health",
  "Finance",
  "Other",
];

const TONES = [
  "Motivational",
  "Sad",
  "Realization",
  "Gratitude",
  "Humorous",
  "Inspirational",
  "Balanced",
];

const PublicLessons = () => {
  const { user } = useAuth();
  const isPremiumUser = !!user?.isPremium;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [tone, setTone] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 6, // 6 per page for grid
        category: category === "all" ? undefined : category,
        emotionalTone: tone === "all" ? undefined : tone,
        sort:
          sort === "newest"
            ? "-createdAt"
            : sort === "saved"
            ? "-favoritesCount"
            : "-createdAt",
        search: search.trim() || undefined,
      };

      const response = await lessonsAPI.getPublic(params);

      // DATA NORMALIZATION
      const data = response.data?.data || [];
      const pagination = response.data?.pagination || {};

      setLessons(data);
      setTotalPages(pagination.pages || 1);
      setTotalLessons(pagination.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchLessons();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, category, tone, sort, search]);

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page lessons-page">
      <Toaster position="top-center" />
      <div className="section-header" style={{ marginTop: 16 }}>
        <div>
          <p className="eyebrow">Discover</p>
          <h1>Community Lessons</h1>
          <p className="section-subtitle">
            {totalLessons} lessons available for you to learn from.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        className="filters-bar"
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
          padding: "16px",
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div className="filter-group" style={{ flex: "1 1 200px" }}>
          <input
            type="text"
            placeholder="Search title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={tone}
          onChange={(e) => {
            setTone(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="all">All Tones</option>
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="newest">Newest First</option>
          <option value="saved">Most Saved</option>
        </select>
      </div>

      {loading ? (
        <div
          style={{ minHeight: "300px", display: "grid", placeItems: "center" }}
        >
          <Spinner label="Finding lessons..." />
        </div>
      ) : (
        <>
          <div className="lessons-grid">
            {lessons.map((lesson) => {
              const isPremiumLesson =
                lesson.isPremium || lesson.accessLevel === "premium";
              const isLocked = isPremiumLesson && !isPremiumUser;
              const creatorName =
                lesson.instructor?.displayName ||
                lesson.instructor?.name ||
                "Instructor";
              const creatorPhoto = lesson.instructor?.photoURL;
              const accessLabel = isPremiumLesson ? "Premium" : "Free";
              const createdDate = lesson.createdAt
                ? new Date(lesson.createdAt).toLocaleDateString()
                : "";
              const preview = lesson.description
                ? `${lesson.description.substring(0, 100)}${
                    lesson.description.length > 100 ? "..." : ""
                  }`
                : "";

              return (
                <div
                  key={lesson._id}
                  className={`lesson-card lesson-card--public ${
                    isLocked ? "lesson-card--locked" : ""
                  }`}
                >
                  {isLocked && (
                    <div className="lesson-lock-overlay">
                      <div className="lesson-lock-message">
                        <span className="lesson-lock-icon" aria-hidden="true">
                          🔒
                        </span>
                        <span>Premium Lesson – Upgrade to view</span>
                      </div>
                    </div>
                  )}

                  <div className="lesson-card__top">
                    <span className="pill">{lesson.category || "Lesson"}</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="pill"
                        style={{
                          background: isPremiumLesson ? "#fef3c7" : "#ecfdf3",
                          color: isPremiumLesson ? "#b45309" : "#15803d",
                        }}
                      >
                        {accessLabel}
                      </span>
                    </div>
                  </div>

                  <h3>{lesson.title}</h3>
                  <p className="lesson-desc">{preview}</p>

                  <div className="lesson-meta-line">
                    <span className="tone">
                      {lesson.emotionalTone || "Balanced"}
                    </span>
                    <span>{createdDate}</span>
                  </div>

                  <div className="lesson-footer">
                    <div className="lesson-author creator-row">
                      <div className="creator-avatar">
                        {creatorPhoto ? (
                          <img
                            src={creatorPhoto}
                            alt={creatorName}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerText = creatorName[0];
                            }}
                          />
                        ) : (
                          creatorName[0]
                        )}
                      </div>
                      <span>{creatorName}</span>
                    </div>
                    {isLocked ? (
                      <Link
                        to="/pricing"
                        className="btn btn-secondary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                      >
                        Unlock
                      </Link>
                    ) : (
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="btn btn-secondary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                      >
                        See Details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {lessons.length === 0 && (
            <div className="empty-state">
              <p>No lessons match your search criteria.</p>
            </div>
          )}

          {/* Pagination Controls */}
          <div
            className="pagination"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "40px",
            }}
          >
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: "600",
              }}
            >
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PublicLessons;
