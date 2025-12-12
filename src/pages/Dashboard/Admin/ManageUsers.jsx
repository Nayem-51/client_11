import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../../api/endpoints";
import Spinner from "../../../components/common/Spinner";
import { toast, Toaster } from "react-hot-toast";
import "../../Pages.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({ limit: 100 });
      const data = response.data?.data || [];
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user.displayName || user.name || "Unknown";
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const isActive = user.isActive !== false;
      return matchesSearch && matchesRole && isActive;
    });
  }, [roleFilter, search, users]);

  const changeUserRole = async (id, newRole) => {
    try {
      await adminAPI.changeUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, role: newRole } : user))
      );
      toast.success(`User role updated to ${newRole}! ✓`);
    } catch (err) {
      console.error("Failed to update user role:", err);
      toast.error(err.response?.data?.message || "Failed to update role.");
    }
  };

  const deleteUser = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate ${name}?`
      )
    ) {
      return;
    }

    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success("User account deactivated. ✓");
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to deactivate user.");
    }
  };

  return (
    <div className="page admin-page">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin Control</p>
          <h1>Manage Users</h1>
          <p className="muted">
            View all contributors, manage roles, and maintain the community.
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
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="instructor">Moderators/Instructors</option>
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
                  <th>Lessons</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.displayName || user.name || "Unknown"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-success"
                            : user.role === "instructor"
                            ? "badge-info"
                            : "badge-warning"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                       <span style={{ fontWeight: 600 }}>{user.lessonsCount || 0}</span>
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <select
                           value={user.role}
                           onChange={(e) => changeUserRole(user._id, e.target.value)}
                           className="badge"
                           style={{ border: '1px solid #ddd', background: 'white', color: '#333' }}
                        >
                            <option value="user">User</option>
                            <option value="instructor">Moderator</option>
                            <option value="admin">Admin</option>
                        </select>
                        
                        <button
                          className="btn btn-danger"
                          style={{padding: '4px 8px', fontSize: '12px'}}
                          onClick={() => deleteUser(user._id, user.displayName || user.email)}
                        >
                          Deactivate
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
