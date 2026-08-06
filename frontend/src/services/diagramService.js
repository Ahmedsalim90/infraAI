const API_BASE = "http://localhost:5000/api/diagrams";

const headers = { "Content-Type": "application/json" };

export async function listDiagrams() {
  const res = await fetch(API_BASE, { headers });
  if (!res.ok) throw new Error("Failed to list diagrams");
  return res.json();
}

export async function createDiagram(name, canvas) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, canvas }),
  });
  if (!res.ok) throw new Error("Failed to create diagram");
  return res.json();
}

export async function getDiagram(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers });
  if (!res.ok) throw new Error("Failed to load diagram");
  return res.json();
}

export async function updateDiagram(id, canvas, name) {
  const body = { canvas };
  if (name) body.name = name;
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to save diagram");
  return res.json();
}