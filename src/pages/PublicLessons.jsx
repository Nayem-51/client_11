import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/common/Spinner";
import { toast, Toaster } from "react-hot-toast";
import LessonCard from "../components/common/LessonCard";
import SkeletonCard from "../components/common/SkeletonCard";
import "../components/common/SkeletonCard.css";
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
        <div className="lessons-grid">
          {Array(8).fill(0).map((_, i) => (
             <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <LessonCard key={lesson._id} lesson={lesson} />
            ))}
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
