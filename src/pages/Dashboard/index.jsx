import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../../api/endpoints";
import { useAuth } from "../../hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "../Pages.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalSaved: 0,
    recentLessons: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's lessons (would need an endpoint)
        const lessonsResponse = await lessonsAPI.getAll();
        const lessons =
          lessonsResponse.data?.data || lessonsResponse.data || [];

        // Filter user's own lessons (would ideally filter by creator/instructor on backend)
        const userLessons = lessons.filter(
          (l) => l.instructor?._id === user?._id || l.creator?._id === user?._id
        );

        setStats({
          totalLessons: userLessons.length,
          totalSaved: user?.savedLessons?.length || 0,
          recentLessons: userLessons.slice(0, 5),
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="page dashboard-page">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Your Dashboard</h1>
        </div>
        <Link to="/dashboard/add-lesson" className="btn btn-primary">
          + Create Lesson
        </Link>
      </div>

      <div className="stats-section">
        <div className="stat-box">
          <p className="stat-label">Total Lessons Created</p>
          <p className="stat-value">{stats.totalLessons}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Saved Lessons</p>
          <p className="stat-value">{stats.totalSaved}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Account Status</p>
          <p className="stat-value">
            {user?.isPremium ? "Premium ⭐" : "Free"}
          </p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Analytics</p>
            <h3>Activity Overview</h3>
          </div>
        </div>
        <div style={{ height: 300, width: "100%", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { name: 'Mon', views: 40, likes: 24 },
                { name: 'Tue', views: 30, likes: 13 },
                { name: 'Wed', views: 20, likes: 58 },
                { name: 'Thu', views: 27, likes: 39 },
                { name: 'Fri', views: 18, likes: 48 },
                { name: 'Sat', views: 23, likes: 38 },
                { name: 'Sun', views: 34, likes: 43 },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="views" stroke="#4338ca" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="likes" stroke="#15803d" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Your Lessons</p>
            <h3>Recently Added</h3>
          </div>
          <Link to="/dashboard/my-lessons" className="text-link">
            View all →
          </Link>
        </div>

        {stats.recentLessons.length === 0 ? (
          <div className="empty-state">
            <p>No lessons created yet.</p>
            <Link to="/dashboard/add-lesson" className="btn btn-primary">
              Create Your First Lesson
            </Link>
          </div>
        ) : (
          <div className="lessons-grid">
            {stats.recentLessons.map((lesson) => (
              <div key={lesson._id} className="lesson-card lesson-card--public">
                <div className="lesson-card__top">
                  <span className="pill">{lesson.category || "Life"}</span>
                  <span
                    className={`pill ${
                      lesson.isPremium || lesson.accessLevel === "premium"
                        ? "pill-accent"
                        : ""
                    }`}
                  >
                    {lesson.isPremium || lesson.accessLevel === "premium"
                      ? "Premium"
                      : "Free"}
                  </span>
                </div>
                <h3>{lesson.title}</h3>
                <p className="lesson-desc">
                  {lesson.description?.slice(0, 100) || "No description"}
                </p>
                <div className="lesson-footer">
                  <Link
                    to={`/lessons/${lesson._id}`}
                    className="btn btn-secondary btn-block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Quick Actions</p>
            <h3>What's Next?</h3>
          </div>
        </div>
        <div className="quick-actions-grid">
          <Link to="/dashboard/add-lesson" className="action-card">
            <span className="action-icon">📝</span>
            <p className="action-title">Create a Lesson</p>
            <p className="action-sub">Share your life wisdom</p>
          </Link>
          <Link to="/dashboard/my-lessons" className="action-card">
            <span className="action-icon">📚</span>
            <p className="action-title">My Lessons</p>
            <p className="action-sub">Manage your content</p>
          </Link>
          <Link to="/dashboard/favorites" className="action-card">
            <span className="action-icon">🔖</span>
            <p className="action-title">Saved Lessons</p>
            <p className="action-sub">Your favorites</p>
          </Link>
          {!user?.isPremium && (
            <Link to="/pricing" className="action-card">
              <span className="action-icon">⭐</span>
              <p className="action-title">Go Premium</p>
              <p className="action-sub">Unlock premium features</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
