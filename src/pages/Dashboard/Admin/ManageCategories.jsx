import React, { useState, useEffect } from "react";
import { categoriesAPI } from "../../../api/endpoints";
import { toast } from "react-hot-toast";
import "../../Pages.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesAPI.getAll();
      setCategories(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setAdding(true);
      const res = await categoriesAPI.create({ name: newCategory });
      setCategories([...categories, res.data.data]);
      setNewCategory("");
      toast.success("Category added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <h1>Manage Categories</h1>
      </div>

      <div className="content-card" style={{ maxWidth: "600px" }}>
        <h3>Add New Category</h3>
        <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category Name"
            className="form-input"
            disabled={adding}
          />
          <button type="submit" className="btn btn-primary" disabled={adding || !newCategory.trim()}>
            {adding ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Existing Categories</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td>{cat.slug}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="btn btn-danger"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        Delete
                      </button>
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

export default ManageCategories;
