# Staff solutions — DO NOT PUBLISH TO APPLICANTS

Reference for grading only. Publish repo without this file (or keep in private staff repo).

## Bug fixes

### Bug 1 — getTasks returns mutable reference

```js
export function getTasks() {
  return [...tasks].sort((a, b) => a.id - b.id);
}
```

### Bug 2 — updateTask (if using broken pattern)

Current store actually passes tests for merge — optional hardening:

```js
export function updateTask(id, patch) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  return Object.assign(task, patch);
}
```

### Bug 3 — PATCH route param

```js
const id = Number(req.params.id);
```

### Missing feature — DELETE

store.js:
```js
export function deleteTask(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}
```

server.js:
```js
app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const ok = deleteTask(id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});
```

Add tests for delete in strong-pass evaluation.
