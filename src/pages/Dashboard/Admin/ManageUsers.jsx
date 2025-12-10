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
      const response = await adminAPI.getUsers({ limit: 100 }); // Fetch sufficient users
      const data = response.data?.data || [];
      // Admin API returns raw user documents. We might need to count lessons separately, 
      // but for now we might not have that count from this endpoint unless we aggregate.
      // The previous implementation was hydrating from ALL lessons which is inefficient.
      // For this assignment, displaying 0 lessons or fetching separate stats is acceptable,
      // OR we can rely on the backend to provide it if we modified the controller.
      // Given constraints, I will preserve the user list functionality first.
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
      const isActive = user.isActive !== false; // Filter out deactivated users
      return matchesSearch && matchesRole && isActive; 
    });
  }, [roleFilter, search, users]);

  const promoteToAdmin = async (id) => {
    try {
      await adminAPI.changeUserRole(id, "admin");
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, role: "admin" } : user))
      );
      toast.success("User promoted to Admin! ✓");
    } catch (err) {
      console.error("Failed to promote user:", err);
      toast.error(err.response?.data?.message || "Failed to promote user.");
    }
  };

  const deleteUser = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate ${name}? They will no longer be able to log in.`
      )
    ) {
      return;
    }

    try {
      await adminAPI.deleteUser(id); // Calls deactivate endpoint
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
                            : "badge-warning"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        {user.role !== "admin" && (
                          <button
                            className="btn btn-primary"
                            onClick={() => promoteToAdmin(user._id)}
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          className="btn btn-danger"
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
