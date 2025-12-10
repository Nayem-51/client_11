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

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStats();
      const statsData = response.data?.data || {};
      
      // Transform API data to component state format
      setStatsData({
        totalUsers: statsData.totalUsers || 0,
        totalPublicLessons: statsData.totalPublicLessons || 0,
        totalFlagged: statsData.totalReportedLessons || 0,
        todayNew: statsData.newLessonsToday || 0,
        topContributors: (statsData.mostActiveContributors || []).map(c => ({
            id: c.email, // using email as ID if _id not populated in aggression result easy access
            name: c.name || "Unknown",
            lessons: c.count
        })),
        growthData: {
           lessonGrowth: (statsData.graphData?.lessons || []).map(d => ({ label: d.name, value: d.lessons })),
           userGrowth: (statsData.graphData?.users || []).map(d => ({ label: d.name, value: d.users }))
        },
        recentLessons: [] // We might still want recent lessons for the list, can fetch separately or omit/mock if not critical. 
        // Actually, the UI has a "New Lessons" list (todayLessons). The API didn't return that list, only count.
        // For the "Today - New Lessons" list, we might still need to fetch some lessons or just the count is enough for the top box?
        // The original UI showed a LIST.
        // Let's keep it simple: Use the stats for the Boxes, and maybe fetch a few recent lessons for the list if needed,
        // OR just rely on the count for the box and maybe remove the list if it's too heavy, 
        // BUT user requirements said "Today’s new lessons" (plural) + "Graphs".
        // The API returns 'newLessonsToday' count.
        // Let's assume for now we just show the count in the box.
        // If we really need the list, we can fetch `adminAPI.getLessons({ limit: 5, sort: '-createdAt' })` separately.
      });

      // Let's fetch recent lessons for the list separately (lightweight)
      const recentRes = await adminAPI.getLessons({ limit: 5 });
      setRecentLessons(recentRes.data?.data || []);

      // Fetch recent reports for the table
      const reportsRes = await adminAPI.getReports({ limit: 8 });
      setReports(reportsRes.data?.data || []);

    } catch (err) {
      toast.error("Failed to load admin analytics.");
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

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
              <p className="stat-label">Today&apos;s New Lessons</p>
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
                          {lesson.category || "General"} •{" "}
                          {lesson.accessLevel || "free"}
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
            {reports.length === 0 ? (
              <p className="muted">No reports detected.</p>
            ) : (
              <table className="compact">
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Reporter</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>{report.lesson?.title || "Unknown Lesson"}</td>
                      <td>{report.reportedBy?.displayName || report.reportedBy?.email || "Unknown"}</td>
                      <td>{report.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                {statsData.growthData.lessonGrowth.map((item) => (
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
                ))}
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
                {statsData.growthData.userGrowth.map((item) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
