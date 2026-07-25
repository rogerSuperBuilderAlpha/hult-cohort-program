import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Locate a path to save our tasks local JSON "database" file
const DATA_FILE = path.join(process.cwd(), 'tasks_db.json');

// Helper function to read tasks safely
function readTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Default fallback tasks matching our dashboard layout
      const initialTasks = [
        { id: '1', title: 'Set up Next.js boilerplate', project: 'Phase 1 Core API', assignee: 'Jayden', status: 'Shipped' },
        { id: '2', title: 'Clean git history and fix PR', project: 'Phase 1 Core API', assignee: 'Jayden', status: 'Shipped' },
        { id: '3', title: 'Design Motivation Dashboard UI', project: 'Phase 1 Core API', assignee: 'Jayden', status: 'In Progress' },
        { id: '4', title: 'Connect local PostgreSQL database', project: 'Phase 1 Core API', assignee: 'Alex', status: 'Todo' },
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialTasks, null, 2));
      return initialTasks;
    }
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    return [];
  }
}

// Helper function to write tasks
function writeTasks(tasks: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// 1. GET Handler: Fetches all stored tasks
export async function GET() {
  const tasks = readTasks();
  return NextResponse.json(tasks);
}

// 2. POST Handler: Handles updating status or adding tasks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, task, id, status } = body;
    let currentTasks = readTasks();

    if (action === 'ADD') {
      currentTasks.push(task);
    } else if (action === 'UPDATE_STATUS') {
      currentTasks = currentTasks.map((t: any) => 
        t.id === id ? { ...t, status: status } : t
      );
    }

    writeTasks(currentTasks);
    return NextResponse.json({ success: true, tasks: currentTasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed processing request' }, { status: 500 });
  }
}