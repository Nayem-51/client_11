import React from "react";
import "../../pages/Pages.css";

const Spinner = ({ label = "Loading..." }) => {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
};

export default Spinner;
