import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LessonCard = ({ lesson }) => {
  const { user } = useAuth();
  const isPremiumLesson = lesson.isPremium || lesson.accessLevel === "premium";
  const isLocked = isPremiumLesson && !user?.isPremium;

  const creatorName =
    lesson.instructor?.displayName || lesson.instructor?.name || "Instructor";
  const creatorPhoto = lesson.instructor?.photoURL;
  const createdDate = lesson.createdAt
    ? new Date(lesson.createdAt).toLocaleDateString()
    : "Unknown Date";
  
  // Use a placeholder if no featured image is provided
  const featuredImage = lesson.featuredImage || "https://placehold.co/600x400/e2e8f0/1e293b?text=Lesson";

  return (
    <div className={`lesson-card ${isLocked ? "locked" : ""}`}>
      <div className="lesson-card-image">
        <img src={featuredImage} alt={lesson.title} loading="lazy" />
        {isLocked && (
          <div className="lock-overlay">
            <span className="lock-icon">🔒</span>
          </div>
        )}
        <div className="card-badges">
           <span className="badge category-badge">{lesson.category}</span>
           {isPremiumLesson && <span className="badge premium-badge">Premium</span>}
        </div>
      </div>

      <div className="lesson-card-content">
        <h3 className="lesson-title">{lesson.title}</h3>
        <p className="lesson-excerpt">
            {lesson.description?.substring(0, 80)}
            {lesson.description?.length > 80 ? "..." : ""}
        </p>

        <div className="lesson-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{createdDate}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👤</span>
            <span>{creatorName}</span>
          </div>
          <div className="meta-item">
             <span className="meta-icon">⭐</span>
             <span>{(lesson.rating || 4.5).toFixed(1)}</span>
          </div>
        </div>

        <div className="lesson-actions">
          {isLocked ? (
             <Link to="/pricing" className="btn btn-primary btn-sm btn-block">
               Unlock Access
             </Link>
          ) : (
             <Link to={`/lessons/${lesson._id}`} className="btn btn-secondary btn-sm btn-block">
               View Details
             </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
