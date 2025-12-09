import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../../../api/endpoints";
import Spinner from "../../../components/common/Spinner";
import "../../Pages.css";

const collectReports = (lesson) => {
  if (Array.isArray(lesson?.reports)) return lesson.reports;
  if (Array.isArray(lesson?.reportReasons)) return lesson.reportReasons;
  if (Array.isArray(lesson?.flags)) return lesson.flags;
  return [];
};

const isFlagged = (lesson) =>
  Boolean(
    lesson?.isFlagged ||
      lesson?.status === "flagged" ||
      (lesson?.reportCount || 0) > 0 ||
      collectReports(lesson).length > 0
  );

const ReportedLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchLessons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await lessonsAPI.getAll();
      const data = res.data?.data || res.data || [];
      setLessons(data);
    } catch (err) {
      setError("Failed to load reported lessons. Please retry.");
      console.error("Admin reported lessons fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const flaggedLessons = useMemo(
    () => lessons.filter((l) => isFlagged(l)),
    [lessons]
  );

  const openModal = (lesson) => setSelected(lesson);
  const closeModal = () => setSelected(null);

  const deleteLesson = (id) => {
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
    closeModal();
  };

  const ignoreReports = (id) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson._id === id
          ? { ...lesson, isFlagged: false, reportCount: 0, reports: [] }
          : lesson
      )
    );
    closeModal();
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Moderation</p>
          <h1>Reported Lessons</h1>
          <p className="muted">
            Review community reports, inspect reasons, and take action.
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
          <p className="stat-label">Flagged Lessons</p>
          <p className="stat-value">{flaggedLessons.length}</p>
          <p className="muted">Needing review</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Total Lessons</p>
          <p className="stat-value">{lessons.length}</p>
          <p className="muted">All imported</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Reports</p>
            <h3>Flagged Content</h3>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading reported lessons..." />
        ) : flaggedLessons.length === 0 ? (
          <p className="muted">No reported lessons at the moment.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Category</th>
                  <th>Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flaggedLessons.map((lesson) => (
                  <tr key={lesson._id}>
                    <td>{lesson.title}</td>
                    <td>{lesson.category || "General"}</td>
                    <td>
                      {lesson.reportCount || collectReports(lesson).length || 1}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => openModal(lesson)}
                        >
                          View Reasons
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteLesson(lesson._id)}
                        >
                          Delete Lesson
                        </button>
                        <button
                          className="btn"
                          onClick={() => ignoreReports(lesson._id)}
                        >
                          Ignore
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

      {selected && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Report Reasons</h3>
            <p className="muted" style={{ marginTop: "4px" }}>
              {selected.title}
            </p>
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {collectReports(selected).length === 0 ? (
                <p className="muted">Flagged without detailed reasons.</p>
              ) : (
                collectReports(selected).map((report, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      background: "#f9fafb",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {report.reason || "Report"}
                    </p>
                    {report.detail && (
                      <p className="muted" style={{ margin: "4px 0" }}>
                        {report.detail}
                      </p>
                    )}
                    <p
                      className="muted"
                      style={{ margin: 0, fontSize: "12px" }}
                    >
                      Reporter:{" "}
                      {report.reporterName || report.reporter || "Unknown"}
                      {report.reporterEmail ? ` • ${report.reporterEmail}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions" style={{ marginTop: "16px" }}>
              <button className="btn" onClick={closeModal}>
                Close
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteLesson(selected._id)}
              >
                Delete Lesson
              </button>
              <button
                className="btn btn-primary"
                onClick={() => ignoreReports(selected._id)}
              >
                Ignore Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportedLessons;
