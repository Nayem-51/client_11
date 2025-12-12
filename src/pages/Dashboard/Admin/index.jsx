import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI, lessonsAPI } from "../../../api/endpoints";
import Spinner from "../../../components/common/Spinner";
import { toast, Toaster } from "react-hot-toast";
import "../../Pages.css";

const monthKeys = (count = 6) => {
  const now = new Date();
  return Array.from({ length: count }, (_, idx) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (count - 1 - idx),
      1
    );
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString(undefined, { month: "short" }),
      date,
    };
  });
};

const getContributorId = (lesson) => {
  const contributor = lesson?.instructor || lesson?.creator || lesson?.author;
  return contributor?._id || contributor?.id || contributor?.email || null;
};

const getContributorName = (lesson) => {
  const contributor = lesson?.instructor || lesson?.creator || lesson?.author;
  return (
    contributor?.name ||
    contributor?.fullName ||
    contributor?.email ||
    "Unknown"
  );
};

const AdminPanel = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalPublicLessons: 0,
    totalFlagged: 0,
    todayNew: 0,
    topContributors: [],
    growthData: { lessonGrowth: [], userGrowth: [] }
  });
  const [recentLessons, setRecentLessons] = useState([]);
  const [reports, setReports] = useState([]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStats();
      const apiData = response.data?.data || {};
      
      setStatsData({
        totalUsers: apiData.totalUsers || 0,
        totalPublicLessons: apiData.publishedLessons || 0,
        totalFlagged: apiData.flaggedLessons || 0,
        todayNew: apiData.recentLessons?.length || 0,
        topContributors: (apiData.topContributors || []).map(c => ({
          id: c._id,
          name: c.displayName || "Unknown",
          lessons: c.lessonCount
        })),
        growthData: {
          lessonGrowth: [],
          userGrowth: []
        }
      });

      setRecentLessons(apiData.recentLessons || []);
    } catch (err) {
      toast.error("Failed to load admin analytics.");
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="page admin-panel-page">
        <Spinner label="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="page admin-page admin-panel-page">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="admin-header">
        <div>
          <p className="eyebrow">System Control</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Monitor platform activity, content health, and growth.
          </p>
        </div>
        <div className="admin-actions">
          <button className="btn" onClick={fetchAdminData}>
            Refresh
          </button>
          <Link
            to="/dashboard/admin/manage-lessons"
            className="btn btn-secondary"
          >
            Manage Lessons
          </Link>
          <Link
            to="/dashboard/admin/reported-lessons"
            className="btn btn-secondary"
          >
            Reported Lessons
          </Link>
          <Link to="/dashboard/admin/profile" className="btn btn-secondary">
            Admin Profile
          </Link>
          <Link to="/dashboard/admin/manage-users" className="btn btn-primary">
            Manage Users
          </Link>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === "growth" ? "active" : ""}`}
          onClick={() => setActiveTab("growth")}
        >
          Growth Analytics
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="admin-section">
          <div className="stats-section">
            <div className="stat-box">
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{statsData.totalUsers}</p>
              <p className="muted">Unique contributors detected</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Public Lessons</p>
              <p className="stat-value">{statsData.totalPublicLessons}</p>
              <p className="muted">Published or publicly visible</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Flagged Lessons</p>
              <p className="stat-value">{statsData.totalFlagged}</p>
              <p className="muted">Needs review</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Today's New Lessons</p>
              <p className="stat-value">{statsData.todayNew}</p>
              <p className="muted">Created in the last 24h</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Contributors</p>
                  <h3>Most Active</h3>
                </div>
              </div>
              {statsData.topContributors.length === 0 ? (
                <p className="muted">No contributor data yet.</p>
              ) : (
                <table className="compact">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Lessons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.topContributors.map((contributor) => (
                      <tr key={contributor.id}>
                        <td>{contributor.name}</td>
                        <td>{contributor.lessons}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="dashboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Today</p>
                  <h3>New Lessons</h3>
                </div>
              </div>
              {recentLessons.length === 0 ? (
                <p className="muted">No new lessons recently.</p>
              ) : (
                <ul className="list">
                  {recentLessons.map((lesson) => (
                    <li key={lesson._id} className="list-item">
                      <div>
                        <p className="list-title">{lesson.title}</p>
                        <p className="muted">
                          {lesson.category || "General"} • {lesson.accessLevel || "free"}
                        </p>
                      </div>
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="text-link"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Quality</p>
                <h3>Flagged / Reported</h3>
              </div>
              <Link to="/dashboard/admin/reported-lessons" className="text-link">
                View All Reports →
              </Link>
            </div>
            <p className="muted">View detailed reports in the Reported Lessons section.</p>
          </div>
        </div>
      )}

      {activeTab === "growth" && (
        <div className="admin-section">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Trend</p>
                  <h3>Lesson Growth</h3>
                </div>
              </div>
              <div className="chart-bars">
                {statsData.growthData.lessonGrowth.length === 0 ? (
                  <p className="muted">No growth data yet.</p>
                ) : (
                  statsData.growthData.lessonGrowth.map((item) => (
                    <div key={item.label} className="chart-bar">
                      <div className="chart-bar__label">{item.label}</div>
                      <div className="chart-bar__track">
                        <div
                          className="chart-bar__fill"
                          style={{ width: `${Math.min(item.value * 12, 100)}%` }}
                        />
                      </div>
                      <div className="chart-bar__value">{item.value}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Trend</p>
                  <h3>User Growth</h3>
                </div>
              </div>
              <div className="chart-bars">
                {statsData.growthData.userGrowth.length === 0 ? (
                  <p className="muted">No growth data yet.</p>
                ) : (
                  statsData.growthData.userGrowth.map((item) => (
                    <div key={item.label} className="chart-bar">
                      <div className="chart-bar__label">{item.label}</div>
                      <div className="chart-bar__track">
                        <div
                          className="chart-bar__fill chart-bar__fill--secondary"
                          style={{ width: `${Math.min(item.value * 20, 100)}%` }}
                        />
                      </div>
                      <div className="chart-bar__value">{item.value}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
