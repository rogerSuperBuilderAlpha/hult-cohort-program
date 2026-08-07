let tasks = [];
let nextId = 1;

export function getTasks() {
  // BUG 1: returns internal reference — mutations leak; also forgets to sort by id
  return tasks;
}

export function createTask(title) {
  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export function updateTask(id, patch) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  const idx = tasks.indexOf(task);
  // BUG 2: rebuilds from patch only — drops title when patching { completed: true }
  tasks[idx] = { id, ...patch };
  return tasks[idx];
}

// MISSING FEATURE: export function deleteTask(id) — not implemented
// Tests expect DELETE /api/tasks/:id (applicant adds route + function)

export function _resetForTests() {
  tasks = [];
  nextId = 1;
}
