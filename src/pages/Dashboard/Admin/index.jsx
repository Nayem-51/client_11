import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../../../api/endpoints";
import "../../Pages.css";

const monthKeys = (count = 6) => {
  const now = new Date();
  return Array.from({ length: count }, (_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - idx), 1);
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
  return contributor?.name || contributor?.fullName || contributor?.email || "Unknown";
};

const AdminPanel = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const lessonsResponse = await lessonsAPI.getAll();
      const allLessons = lessonsResponse.data?.data || lessonsResponse.data || [];
      setLessons(allLessons);
    } catch (err) {
      setError("Failed to load admin analytics. Please retry.");
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const todayLessons = useMemo(() => {
    const today = new Date();
    return lessons.filter((lesson) => {
      const created = new Date(lesson?.createdAt || lesson?.updatedAt || 0);
      return !Number.isNaN(created) && created.toDateString() === today.toDateString();
    });
  }, [lessons]);

  const flaggedLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) => lesson?.isFlagged || lesson?.status === "flagged" || (lesson?.reportCount || 0) > 0
      ),
    [lessons]
  );

  const publicLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) => lesson?.isPublished || lesson?.isPublic || lesson?.accessLevel === "public" || lesson?.visibility === "public"
      ),
    [lessons]
  );

  const contributors = useMemo(() => {
    const map = new Map();
    lessons.forEach((lesson) => {
      const id = getContributorId(lesson);
      if (!id) return;
      const existing = map.get(id) || { id, name: getContributorName(lesson), lessons: 0 };
      map.set(id, { ...existing, lessons: existing.lessons + 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.lessons - a.lessons);
  }, [lessons]);

  const growthData = useMemo(() => {
    const months = monthKeys(6);
    const lessonMap = Object.fromEntries(months.map(({ key }) => [key, 0]));
    const userMap = Object.fromEntries(months.map(({ key }) => [key, 0]));
    const firstContribution = new Map();

    lessons.forEach((lesson) => {
      const created = new Date(lesson?.createdAt || lesson?.updatedAt || Date.now());
      if (Number.isNaN(created)) return;
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      if (lessonMap[key] !== undefined) {
        lessonMap[key] += 1;
      }

      const contributorId = getContributorId(lesson);
      if (!contributorId) return;
      if (!firstContribution.has(contributorId)) {
        firstContribution.set(contributorId, created);
      } else if (created < firstContribution.get(contributorId)) {
        firstContribution.set(contributorId, created);
      }
    });

    firstContribution.forEach((date) => {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (userMap[key] !== undefined) {
        userMap[key] += 1;
      }
    });

    return {
      lessonGrowth: months.map(({ key, label }) => ({ label, value: lessonMap[key] || 0 })),
      userGrowth: months.map(({ key, label }) => ({ label, value: userMap[key] || 0 })),
    };
  }, [lessons]);

  const stats = useMemo(
    () => ({
      totalLessons: lessons.length,
      totalPublicLessons: publicLessons.length,
      totalUsers: contributors.length,
      totalFlagged: flaggedLessons.length,
      todayNew: todayLessons.length,
      topContributors: contributors.slice(0, 5),
    }),
    [contributors, flaggedLessons.length, lessons.length, publicLessons.length, todayLessons.length]
  );

  if (loading) {
    return (
      <div className="page admin-panel-page">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page admin-page admin-panel-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">System Control</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">Monitor platform activity, content health, and growth.</p>
        </div>
        <div className="admin-actions">
          <button className="btn" onClick={fetchAdminData}>
            Refresh
          </button>
          <Link to="/dashboard/admin/manage-lessons" className="btn btn-secondary">
            Manage Lessons
          </Link>
          <Link to="/dashboard/admin/reported-lessons" className="btn btn-secondary">
            Reported Lessons
          </Link>
          <Link to="/dashboard/admin/manage-users" className="btn btn-primary">
            Manage Users
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => setActiveTab("lessons")}
        >
          Manage Lessons
        </button>
        <button
          className={`admin-tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="admin-section">
          <div className="stats-section">
            <div className="stat-box">
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{stats.totalUsers}</p>
              <p className="muted">Unique contributors detected</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Public Lessons</p>
              <p className="stat-value">{stats.totalPublicLessons}</p>
              <p className="muted">Published or publicly visible</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Flagged Lessons</p>
              <p className="stat-value">{stats.totalFlagged}</p>
              <p className="muted">Needs review</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Today&apos;s New Lessons</p>
              <p className="stat-value">{stats.todayNew}</p>
              <p className="muted">Created in the last 24h</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Trend</p>
                  <h3>Lesson Growth</h3>
                </div>
              </div>
              <div className="chart-bars">
                {growthData.lessonGrowth.map((item) => (
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
                {growthData.userGrowth.map((item) => (
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

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Contributors</p>
                  <h3>Most Active</h3>
                </div>
              </div>
              {stats.topContributors.length === 0 ? (
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
                    {stats.topContributors.map((contributor) => (
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
              {todayLessons.length === 0 ? (
                <p className="muted">No new lessons today.</p>
              ) : (
                <ul className="list">
                  {todayLessons.map((lesson) => (
                    <li key={lesson._id} className="list-item">
                      <div>
                        <p className="list-title">{lesson.title}</p>
                        <p className="muted">
                          {lesson.category || "General"} • {lesson.accessLevel || "free"}
                        </p>
                      </div>
                      <Link to={`/lessons/${lesson._id}`} className="text-link">
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
            </div>
            {flaggedLessons.length === 0 ? (
              <p className="muted">No flagged lessons detected.</p>
            ) : (
              <table className="compact">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedLessons.slice(0, 8).map((lesson) => (
                    <tr key={lesson._id}>
                      <td>{lesson.title}</td>
                      <td>{lesson.category || "General"}</td>
                      <td>{lesson.reportCount || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "lessons" && (
        <div className="admin-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Content</p>
              <h3>Manage All Lessons</h3>
            </div>
          </div>
          <div className="admin-table">
            {lessons.length === 0 ? (
              <p className="empty">No lessons found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.slice(0, 15).map((lesson) => (
                    <tr key={lesson._id}>
                      <td>{lesson.title}</td>
                      <td>{lesson.category || "General"}</td>
                      <td>
                        {lesson.isPremium || lesson.accessLevel === "premium"
                          ? "Premium"
                          : "Free"}
                      </td>
                      <td>
                        {lesson.isPublished || lesson.isPublic ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-warning">Draft</span>
                        )}
                      </td>
                      <td>{lesson.reportCount || (lesson.isFlagged ? 1 : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="admin-section">
          <h3>Content Reports</h3>
          <p className="muted">
            Reports and moderation workflows can be wired here once the API is available.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
