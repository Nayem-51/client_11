import React, { useState, useEffect } from "react";
import { lessonsAPI } from "../../../api/endpoints";
import "../../Pages.css";

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalUsers: 0,
    premiumCount: 0,
  });
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const lessonsResponse = await lessonsAPI.getAll();
        const allLessons =
          lessonsResponse.data?.data || lessonsResponse.data || [];

        setLessons(allLessons);
        setStats({
          totalLessons: allLessons.length,
          totalUsers: 0, // Would fetch from /api/users endpoint
          premiumCount: 0, // Would fetch from /api/users endpoint
        });
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="page admin-panel-page">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page admin-panel-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">System Control</p>
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => setActiveTab("lessons")}
        >
          Manage Lessons
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="admin-section">
          <h3>System Overview</h3>
          <div className="stats-section">
            <div className="stat-box">
              <p className="stat-label">Total Lessons</p>
              <p className="stat-value">{stats.totalLessons}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Registered Users</p>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Premium Users</p>
              <p className="stat-value">{stats.premiumCount}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Pending Reports</p>
              <p className="stat-value">0</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "lessons" && (
        <div className="admin-section">
          <h3>Manage All Lessons</h3>
          <div className="admin-table">
            {lessons.length === 0 ? (
              <p className="empty">No lessons found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Access Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.slice(0, 10).map((lesson) => (
                    <tr key={lesson._id}>
                      <td>{lesson.title}</td>
                      <td>{lesson.category}</td>
                      <td>
                        {lesson.isPremium || lesson.accessLevel === "premium"
                          ? "Premium"
                          : "Free"}
                      </td>
                      <td>
                        {lesson.isPublished ? (
                          <span className="badge success">Published</span>
                        ) : (
                          <span className="badge">Draft</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-small">View</button>
                        <button className="btn btn-small btn-danger">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-section">
          <h3>User Management</h3>
          <p className="muted">User management tools coming soon...</p>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="admin-section">
          <h3>Content Reports</h3>
          <p className="muted">No reports to display</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
