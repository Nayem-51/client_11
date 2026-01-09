import React from "react";
import "./SkeletonCard.css";

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
        <div className="skeleton-row">
          <div className="skeleton-pill"></div>
          <div className="skeleton-pill"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
