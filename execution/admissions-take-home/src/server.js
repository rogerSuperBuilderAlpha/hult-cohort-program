import express from 'express';
import { createTask, getTasks, updateTask } from './store.js';

export const app = express();

app.use(express.json());

app.get('/api/tasks', (_req, res) => {
  res.json({ tasks: getTasks() });
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title required' });
  }
  const task = createTask(title);
  res.status(201).json({ task });
});

// BUG 3: wrong param name — route uses :id but handler reads req.params.taskId
app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.taskId);
  const { completed } = req.body;
  const task = updateTask(id, { completed });
  if (!task) return res.status(404).json({ error: 'not found' });
  res.json({ task });
});

app.get('/health', (_req, res) => res.json({ ok: true }));
