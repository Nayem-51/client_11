import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { lessonsAPI } from "../api/endpoints";
import apiClient from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const normalizeLesson = (payload) => {
  if (!payload) return null;
  // Some APIs nest lesson under data or lesson key
  if (payload.lesson) return payload.lesson;
  return payload;
};

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const userId = user?._id || user?.id || user?.uid;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDescription, setReportDescription] = useState("");
  const [similarLessons, setSimilarLessons] = useState([]);

  const randomViews = useMemo(() => Math.floor(Math.random() * 10000), []);

  const isPremiumLesson =
    lesson?.accessLevel?.toLowerCase?.() === "premium" || lesson?.isPremium;
  const canView = !isPremiumLesson || user?.isPremium;

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await lessonsAPI.getById(id);
        const normalized = normalizeLesson(response.data);
        setLesson(normalized);
        const likesArray = normalized?.likes || [];
        setLikesCount(normalized?.likesCount ?? likesArray.length);
        setIsLiked(likesArray?.some((likeId) => likeId === userId));
        const favs = normalized?.favorites || normalized?.favoritedBy || [];
        setIsFavorite(favs?.some((favId) => favId === userId));
        setComments(normalized?.comments || []);
      } catch (err) {
        setError(err.message || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, userId]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const response = await lessonsAPI.getAll();
        const items = response.data?.data || response.data || [];
        const filtered = items
          .filter((item) => item._id !== id)
          .filter((item) =>
            lesson?.category
              ? item.category === lesson.category ||
                item.emotionalTone === lesson.emotionalTone
              : item.emotionalTone === lesson?.emotionalTone
          )
          .slice(0, 6);
        setSimilarLessons(filtered);
      } catch (_err) {
        // silently ignore similar fetch issues
      }
    };

    if (lesson) fetchSimilar();
  }, [lesson, id]);

  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await lessonsAPI.addFavorite(id);
      setIsFavorite(true);
    } catch (err) {
      console.error("Failed to add favorite:", err);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await lessonsAPI.removeFavorite(id);
      setIsFavorite(false);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please log in to like");
      navigate("/login");
      return;
    }

    try {
      await apiClient.post(`/lessons/${id}/like`);
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Failed to like lesson:", err);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await apiClient.post(`/lessons/${id}/report`, {
        reason: reportReason,
        description: reportDescription
      });
      alert("Report submitted. Thank you.");
      setReportOpen(false);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Failed to submit report");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: lesson?.title || "Life Lesson",
      text: lesson?.description || "Check out this lesson",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;

    const newComment = {
      user: {
        _id: userId,
        name: user?.name || user?.displayName || "You",
        photoURL: user?.photoURL,
      },
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await apiClient.post(`/lessons/${id}/comments`, {
        text: newComment.text,
      });
    } catch (err) {
      console.error("Failed to post comment, showing locally:", err);
    }

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  if (loading)
    return (
      <div className="page">
        <p>Loading lesson...</p>
      </div>
    );
  if (error)
    return (
      <div className="page">
        <p>Error: {error}</p>
      </div>
    );
  if (!lesson)
    return (
      <div className="page">
        <p>Lesson not found</p>
      </div>
    );

  const createdDate = lesson.createdAt
    ? new Date(lesson.createdAt).toLocaleDateString()
    : "";
  const updatedDate = lesson.updatedAt
    ? new Date(lesson.updatedAt).toLocaleDateString()
    : "";

  const creatorName =
    lesson.creator?.name ||
    lesson.creator?.displayName ||
    lesson.author?.name ||
    lesson.author ||
    "Community Mentor";
  const creatorPhoto =
    lesson.creator?.photoURL || lesson.authorPhoto || lesson.creator?.avatar;
  const creatorLessonCount =
    lesson.creator?.totalLessons || lesson.totalLessons;

  return (
    <div className="page lesson-details-page">
      {isPremiumLesson && !canView && (
        <div className="premium-banner">
          <div>
            <p className="eyebrow">Premium Lesson</p>
            <h2>Upgrade to unlock this lesson</h2>
            <p className="section-subtitle">
              This premium insight is available for premium members. Upgrade to
              view the full story.
            </p>
          </div>
          <div className="premium-actions">
            <Link to="/pricing" className="btn btn-primary">
              View Plans
            </Link>
            <Link to="/pricing" className="btn btn-secondary">
              Already premium? Refresh
            </Link>
          </div>
        </div>
      )}

      <div className={`lesson-shell ${!canView ? "is-locked" : ""}`}>
        <header className="lesson-hero">
          <div>
            <div className="pill-row">
              <span className="pill">{lesson.category || "Life"}</span>
              <span className="pill pill-accent">
                {lesson.emotionalTone || "Balanced"}
              </span>
              {isPremiumLesson && (
                <span className="pill pill-warning">Premium</span>
              )}
            </div>
            <h1>{lesson.title}</h1>
            <p className="lesson-subline">{lesson.description}</p>
          </div>
          {lesson.featuredImage && (
            <div className="featured-image-wrap">
              <img src={lesson.featuredImage} alt={lesson.title} />
            </div>
          )}
        </header>

        <section className="lesson-metadata">
          <div>
            <p className="meta-label">Created</p>
            <p className="meta-value">{createdDate || "-"}</p>
          </div>
          <div>
            <p className="meta-label">Updated</p>
            <p className="meta-value">{updatedDate || "-"}</p>
          </div>
          <div>
            <p className="meta-label">Visibility</p>
            <p className="meta-value">{lesson.accessLevel || "Public"}</p>
          </div>
          <div>
            <p className="meta-label">Reading Time</p>
            <p className="meta-value">{lesson.readTime || "~3 min"}</p>
          </div>
        </section>

        <section className="lesson-body-block">
          <h3>Lesson Insight</h3>
          <div className="lesson-body-text">
            {lesson.content || lesson.story || "No content provided."}
          </div>
        </section>

        <section className="author-card">
          <div className="author-left">
            <div className="creator-avatar" aria-hidden>
              {creatorPhoto ? (
                <img src={creatorPhoto} alt={creatorName} />
              ) : (
                creatorName[0]
              )}
            </div>
            <div>
              <p className="creator-name">{creatorName}</p>
              <p className="creator-sub">
                {creatorLessonCount
                  ? `${creatorLessonCount} lessons`
                  : "Author"}
              </p>
            </div>
          </div>
          <Link to="/profile" className="btn btn-secondary">
            View all lessons by this author
          </Link>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            ❤️ {likesCount.toLocaleString()} Likes
          </div>
          <div className="stat-card">
            🔖 {(lesson.favoritesCount || 0).toLocaleString()} Favorites
          </div>
          <div className="stat-card">
            👀 {randomViews.toLocaleString()} Views
          </div>
        </section>

        <section className="actions-row">
          <button onClick={handleLike} className="btn btn-secondary">
            {isLiked ? "❤️ Liked" : "❤️ Like"}
          </button>
          {isFavorite ? (
            <button
              onClick={handleRemoveFavorite}
              className="btn btn-secondary"
            >
              🔖 Saved
            </button>
          ) : (
            <button onClick={handleAddFavorite} className="btn btn-secondary">
              🔖 Save to Favorites
            </button>
          )}
          <button
            onClick={() => setReportOpen(true)}
            className="btn btn-secondary"
          >
            🚩 Report Lesson
          </button>
          <button onClick={handleShare} className="btn btn-secondary">
            Share
          </button>
        </section>

        <section className="comments-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Comments</p>
              <h3>Join the discussion</h3>
            </div>
          </div>
          <div className="comment-input">
            <textarea
              placeholder={
                isAuthenticated
                  ? "Share your thoughts"
                  : "Log in to add a comment"
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isAuthenticated}
            />
            <button
              className="btn btn-primary"
              onClick={handleCommentSubmit}
              disabled={!isAuthenticated}
            >
              Post Comment
            </button>
          </div>

          <div className="comments-list">
            {comments.length === 0 && <p className="muted">No comments yet.</p>}
            {comments.map((c, idx) => (
              <div key={`${c._id || idx}`} className="comment-item">
                <div className="comment-avatar" aria-hidden>
                  {c.user?.photoURL ? (
                    <img src={c.user.photoURL} alt={c.user?.name || "User"} />
                  ) : (
                    (c.user?.name || "?")[0]
                  )}
                </div>
                <div>
                  <p className="comment-author">{c.user?.name || "User"}</p>
                  <p className="comment-text">{c.text}</p>
                  <p className="comment-date">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="similar-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Similar Lessons</p>
              <h3>Recommended for you</h3>
            </div>
          </div>
          <div className="lessons-grid">
            {similarLessons.map((item) => {
              const lessonId = item._id || item.id;
              const locked =
                item.accessLevel?.toLowerCase?.() === "premium" &&
                !user?.isPremium;
              return (
                <div
                  key={lessonId}
                  className={`lesson-card lesson-card--public ${
                    locked ? "lesson-card--locked" : ""
                  }`}
                >
                  <div className="lesson-card__top">
                    <span className="pill">{item.category || "Life"}</span>
                    <span
                      className={`pill ${
                        item.accessLevel?.toLowerCase?.() === "premium"
                          ? "pill-accent"
                          : ""
                      }`}
                    >
                      {item.accessLevel || "Public"}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="lesson-desc">
                    {item.description?.slice(0, 120) || "No description"}
                  </p>
                  <div className="lesson-meta-line">
                    <span className="tone">
                      Tone: {item.emotionalTone || "Balanced"}
                    </span>
                    <span className="date">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="lesson-footer">
                    <Link
                      to={`/lessons/${lessonId}`}
                      className="btn btn-secondary btn-block"
                    >
                      {locked ? "🔒 Premium" : "See Details"}
                    </Link>
                  </div>
                  {locked && <div className="lesson-lock-overlay" />}
                </div>
              );
            })}
            {similarLessons.length === 0 && (
              <p className="muted">No related lessons found.</p>
            )}
          </div>
        </section>
      </div>

      {!canView && <div className="lesson-blur-cover" aria-hidden />}

      {reportOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Report Lesson</h3>
            <div className="report-form">
              <label>Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="inappropriate">Inappropriate Content</option>
                <option value="offensive">Hate Speech or Harassment</option>
                <option value="spam">Spam or Promotional Content</option>
                <option value="copyright">Copyright Violation</option>
                <option value="other">Other</option>
              </select>
              
              <label>Description (Required)</label>
              <textarea
                placeholder="Please provide more details..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="report-desc-input"
              />
              
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setReportOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleReport}
                  disabled={!reportDescription.trim()}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDetails;
