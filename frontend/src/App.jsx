import { useEffect, useState } from "react";
import { api } from "./api";

const emptyForm = {
  name: "",
  category: "General",
  price: "",
  quantity: "",
  description: "",
};

const categories = [
  "General",
  "Electronics",
  "Apparel",
  "Home",
  "Grocery",
  "Other",
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "ok") => {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.list();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description.trim(),
    };

    try {
      if (editingId) {
        await api.update(editingId, payload);
        showToast("Product updated");
      } else {
        await api.create(payload);
        showToast("Product created");
      }
      resetForm();
      await load();
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.remove(id);
      if (editingId === id) resetForm();
      showToast("Product deleted");
      await load();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="layout">
        <header className="hero">
          <div className="brand">NEXUS</div>
          <p>
            A focused inventory desk for create, read, update, and delete —
            connected to AWS RDS MySQL and served from EC2.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={resetForm}>
              New product
            </button>
            <button className="btn btn-ghost" type="button" onClick={load}>
              Refresh
            </button>
          </div>
        </header>

        <main className="workspace">
          <section className="panel panel-list">
            <div className="panel-head">
              <h2>Catalog</h2>
              <span className="badge">{products.length} items</span>
            </div>

            {loading && <div className="status">Loading inventory…</div>}
            {!loading && error && <div className="status error">{error}</div>}
            {!loading && !error && products.length === 0 && (
              <div className="empty">No products yet. Add the first one.</div>
            )}

            {!loading && !error && products.length > 0 && (
              <ul className="product-list">
                {products.map((product, index) => (
                  <li
                    key={product.id}
                    className="product-item"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className="product-meta">
                      <h3>{product.name}</h3>
                      <p>{product.description || "No description"}</p>
                      <div className="chips">
                        <span className="chip">{product.category}</span>
                        <span className="chip price">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <span className="chip">Qty {product.quantity}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => onEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => onDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel panel-form">
            <div className="panel-head">
              <h2>{editingId ? "Edit product" : "Add product"}</h2>
              <span className="badge">{editingId ? `#${editingId}` : "Create"}</span>
            </div>
            <form className="form-body" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Wireless headphones"
                  required
                  maxLength={120}
                />
              </div>

              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={onChange}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row-2">
                <div className="field">
                  <label htmlFor="price">Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={onChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={onChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Short product notes"
                  maxLength={1000}
                />
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update" : "Create"}
                </button>
                {editingId && (
                  <button className="btn btn-ghost" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        </main>
      </div>

      {toast && (
        <div className={`toast ${toast.type === "error" ? "error" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
