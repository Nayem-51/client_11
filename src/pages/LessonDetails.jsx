import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { lessonsAPI } from "../api/endpoints";
import apiClient from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const normalizeLesson = (payload) => {
  if (!payload) return null;
  // If API returns { success: true, data: {...} }, extract data
  if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return payload.data;
  }
  // Some APIs nest lesson under lesson key
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
  const [reportReason, setReportReason] = useState("Inappropriate Content");
  // const [reportReason, setReportReason] = useState("Inappropriate Content");
  const [similarCategoryLessons, setSimilarCategoryLessons] = useState([]);
  const [similarToneLessons, setSimilarToneLessons] = useState([]);

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
        setIsFavorite(favs?.some((favId) => String(favId) === String(userId)));
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
      if (!lesson) return;

      try {
        const [catRes, toneRes] = await Promise.all([
          lessonsAPI.getPublic({
            category: lesson.category,
            limit: 7, // fetch 7 to ensure we have 6 after filtering current
          }),
          lessonsAPI.getPublic({
            emotionalTone: lesson.emotionalTone,
            limit: 7,
          }),
        ]);

        const catItems = catRes.data?.data || [];
        const toneItems = toneRes.data?.data || [];

        setSimilarCategoryLessons(
          catItems.filter((item) => item._id !== id).slice(0, 6)
        );
        setSimilarToneLessons(
          toneItems.filter((item) => item._id !== id).slice(0, 6)
        );
      } catch (_err) {
        // silently ignore similar fetch issues
      }
    };

    fetchSimilar();
  }, [lesson, id]);

  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await lessonsAPI.addFavorite(id);
      setIsFavorite(true);
      setLesson((prev) =>
        prev
          ? {
              ...prev,
              favorites: [...(prev.favorites || []), userId],
              favoritesCount: (prev.favoritesCount || 0) + 1,
            }
          : prev
      );
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
      setLesson((prev) =>
        prev
          ? {
              ...prev,
              favorites: (prev.favorites || []).filter(
                (fid) => String(fid) !== String(userId)
              ),
              favoritesCount: Math.max((prev.favoritesCount || 0) - 1, 0),
            }
          : prev
      );
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
          </div>
        </div>
      )}

      <div className={`lesson-shell ${!canView ? "is-locked" : ""}`}>
        
        {/* SECTION 1: OVERVIEW / DESCRIPTION */}
        <header className="lesson-hero">
          <div className="lesson-hero-content">
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
            
            <div className="lesson-hero-meta">
               <div className="creator-row">
                 <div className="creator-avatar" aria-hidden>
                   {creatorPhoto ? (
                     <img src={creatorPhoto} alt={creatorName} />
                   ) : (
                     creatorName[0]
                   )}
                 </div>
                 <span>By {creatorName}</span>
               </div>
               <span>•</span>
               <span>{createdDate || "Recently"}</span>
            </div>
          </div>
        
          {lesson.image && (
            <div className="featured-image-wrap">
              <img src={lesson.image} alt={lesson.title} />
            </div>
          )}
        </header>

        {/* SECTION 2: KEY INFORMATION */}
        <section className="key-info-section">
          <h3>Key Information</h3>
          <div className="key-info-grid">
             <div className="info-item">
               <span className="label">Reading Time</span>
               <span className="value">{lesson.readTime || "~3 min"}</span>
             </div>
             <div className="info-item">
               <span className="label">Difficulty</span>
               <span className="value">{lesson.difficulty || "Beginner"}</span>
             </div>
             <div className="info-item">
               <span className="label">Language</span>
               <span className="value">{lesson.language || "English"}</span>
             </div>
             <div className="info-item">
                <span className="label">Visibility</span>
                <span className="value">{lesson.accessLevel || "Public"}</span>
             </div>
          </div>
        </section>

        <hr className="divider" />

        <section className="lesson-body-block">
          <h3>Description & Overview</h3>
          <div className="lesson-body-text">
            {lesson.content || lesson.story || "No content provided."}
          </div>
        </section>

        <section className="actions-row">
          <button onClick={handleLike} className="btn btn-secondary">
            {isLiked ? "❤️ Liked" : "❤️ Like"} ({likesCount})
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
               🔖 Save
            </button>
          )}
          <button onClick={handleShare} className="btn btn-secondary">
            Share
          </button>
           <button
            onClick={() => setReportOpen(true)}
            className="btn btn-ghost"
            style={{ marginLeft: "auto", fontSize: "0.8rem" }}
          >
            🚩 Report
          </button>
        </section>

        {/* SECTION 3: REVIEWS / RATINGS */}
        <section className="comments-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Reviews</p>
              <h3>Community Feedback</h3>
            </div>
          </div>
          
          <div className="comments-list">
            {comments.length === 0 && <p className="muted">No reviews yet. Be the first to share your thoughts.</p>}
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
                </div>
              </div>
            ))}
          </div>
          
          <div className="comment-input-area" style={{ marginTop: "2rem" }}>
             <h4>Leave a Review</h4>
             <div className="comment-input">
                <textarea
                  placeholder={
                    isAuthenticated
                      ? "Write your review here..."
                      : "Log in to leave a review"
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
                  Submit Review
                </button>
             </div>
          </div>
        </section>

        {/* SECTION 4: RELATED ITEMS */}
        <section className="similar-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Related</p>
              <h3>You might also like</h3>
            </div>
          </div>
          <div className="lessons-grid">
            {similarCategoryLessons.map((item) => {
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
                  <div className="lesson-footer">
                    <Link
                      to={`/lessons/${lessonId}`}
                      className="btn btn-secondary btn-block"
                    >
                      View
                    </Link>
                  </div>
                  {locked && <div className="lesson-lock-overlay" />}
                </div>
              );
            })}
             {similarCategoryLessons.length === 0 && (
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
            <p>Select a reason</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option>Inappropriate Content</option>
              <option>Hate Speech or Harassment</option>
              <option>Misleading or False Information</option>
              <option>Spam or Promotional Content</option>
              <option>Sensitive or Disturbing Content</option>
              <option>Other</option>
            </select>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleReport}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDetails;
