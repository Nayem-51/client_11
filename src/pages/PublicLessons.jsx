import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const normalizeLessons = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString();
  } catch (_e) {
    return "";
  }
};

const PublicLessons = () => {
  const { user } = useAuth();
  const isPremiumUser = !!user?.isPremium;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await lessonsAPI.getPublic();
        setLessons(normalizeLessons(response.data));
      } catch (err) {
        setError(err.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <p>Loading lessons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="page lessons-page">
      <div className="section-header" style={{ marginTop: 16 }}>
        <div>
          <p className="eyebrow">Browse Public Life Lessons</p>
          <h1>Shared wisdom from the community</h1>
          <p className="section-subtitle">
            Discover public lessons. Premium lessons stay locked until you
            upgrade.
          </p>
        </div>
      </div>

      <div className="lessons-grid">
        {lessons.map((lesson) => {
          const lessonId = lesson._id || lesson.id;
          const accessLevel =
            lesson.accessLevel ||
            lesson.access ||
            (lesson.isPremium ? "premium" : "public");
          const isPremiumLesson = accessLevel?.toLowerCase() === "premium";
          const locked = isPremiumLesson && !isPremiumUser;

          const creatorName =
            lesson.creator?.name ||
            lesson.creator?.displayName ||
            lesson.instructor?.name ||
            lesson.instructor?.displayName ||
            lesson.author?.name ||
            lesson.author ||
            "Community Mentor";
          const creatorPhoto =
            lesson.creator?.photoURL ||
            lesson.instructor?.photoURL ||
            lesson.authorPhoto ||
            null;

          const tone = lesson.emotionalTone || lesson.tone || "Balanced";

          return (
            <div
              key={lessonId}
              className={`lesson-card lesson-card--public ${
                locked ? "lesson-card--locked" : ""
              }`}
            >
              <div className="lesson-card__top">
                <span className="pill">{lesson.category || "Life"}</span>
                <span
                  className={`pill ${isPremiumLesson ? "pill-accent" : ""}`}
                >
                  {isPremiumLesson ? "Premium" : "Public"}
                </span>
              </div>

              <h3>{lesson.title}</h3>
              <p className="lesson-desc">
                {lesson.description?.slice(0, 150) ||
                  "No description provided."}
              </p>

              <div className="lesson-meta-line">
                <span className="tone">Tone: {tone}</span>
                <span className="date">{formatDate(lesson.createdAt)}</span>
              </div>

              <div className="creator-row">
                <div className="creator-avatar" aria-hidden>
                  {creatorPhoto ? (
                    <img src={creatorPhoto} alt={creatorName} />
                  ) : (
                    creatorName[0]
                  )}
                </div>
                <div>
                  <div className="creator-name">{creatorName}</div>
                  <div className="creator-sub">
                    Access: {isPremiumLesson ? "Premium" : "Public"}
                  </div>
                </div>
              </div>

              <div className="lesson-footer">
                {locked ? (
                  <Link to="/pricing" className="btn btn-secondary btn-block">
                    🔒 Premium Lesson – Upgrade to view
                  </Link>
                ) : (
                  <Link
                    to={`/lessons/${lessonId}`}
                    className="btn btn-secondary btn-block"
                  >
                    See Details
                  </Link>
                )}
              </div>

              {locked && <div className="lesson-lock-overlay" />}
            </div>
          );
        })}
      </div>

      {lessons.length === 0 && (
        <div className="empty-state">
          <p>No lessons available</p>
        </div>
      )}
    </div>
  );
};

export default PublicLessons;
