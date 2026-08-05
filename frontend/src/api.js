const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

export const api = {
  list: () => request("/api/products"),
  create: (body) =>
    request("/api/products", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id) => request(`/api/products/${id}`, { method: "DELETE" }),
};
