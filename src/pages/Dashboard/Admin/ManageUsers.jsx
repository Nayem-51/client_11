import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { lessonsAPI } from "../../../api/endpoints";
import Spinner from "../../../components/common/Spinner";
import "../../Pages.css";

const getUserId = (lesson) => {
  const contributor = lesson?.instructor || lesson?.creator || lesson?.author;
  return contributor?._id || contributor?.id || contributor?.email || null;
};

const getUserName = (lesson) => {
  const contributor = lesson?.instructor || lesson?.creator || lesson?.author;
  return (
    contributor?.name ||
    contributor?.fullName ||
    contributor?.email ||
    "Unknown"
  );
};

const getUserEmail = (lesson) => {
  const contributor = lesson?.instructor || lesson?.creator || lesson?.author;
  return contributor?.email || "Unavailable";
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const hydrateUsers = (lessons) => {
    const map = new Map();
    lessons.forEach((lesson) => {
      const id = getUserId(lesson);
      if (!id) return;
      const role =
        lesson?.instructor?.role ||
        lesson?.creator?.role ||
        lesson?.author?.role ||
        "user";
      const entry = map.get(id) || {
        id,
        name: getUserName(lesson),
        email: getUserEmail(lesson),
        role,
        totalLessons: 0,
      };
      map.set(id, { ...entry, totalLessons: entry.totalLessons + 1 });
    });
    return Array.from(map.values()).sort(
      (a, b) => b.totalLessons - a.totalLessons
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const lessonsResponse = await lessonsAPI.getAll();
      const allLessons =
        lessonsResponse.data?.data || lessonsResponse.data || [];
      setUsers(hydrateUsers(allLessons));
    } catch (err) {
      setError("Could not load users. Please try again.");
      console.error("Failed to fetch users for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  const promoteToAdmin = (id) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: "admin" } : user))
    );
    setNotice("User role updated to admin (client-side only).");
  };

  const deleteUser = (id) => {
    const target = users.find((u) => u.id === id);
    const confirmed = window.confirm(
      `Delete ${target?.name || "this user"}? This cannot be undone in the UI.`
    );
    if (!confirmed) return;
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setNotice("User removed from list (client-side only).");
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin Control</p>
          <h1>Manage Users</h1>
          <p className="muted">
            View all contributors, promote admins, and keep the community
            healthy.
          </p>
        </div>
        <div className="admin-actions">
          <button className="btn" onClick={fetchUsers} disabled={loading}>
            Refresh
          </button>
          <Link to="/dashboard/admin" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {notice && <div className="toast toast-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Directory</p>
            <h3>All Users</h3>
          </div>
          <div className="admin-actions">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading users..." />
        ) : filteredUsers.length === 0 ? (
          <p className="muted">No users match your filters.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Total Lessons</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>{user.totalLessons}</td>
                    <td>
                      <div className="table-actions">
                        {user.role !== "admin" && (
                          <button
                            className="btn btn-primary"
                            onClick={() => promoteToAdmin(user.id)}
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
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
    </div>
  );
};

export default ManageUsers;
