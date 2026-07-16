import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { Project, Task, TaskStatus, TaskPriority, UserProfile } from "./types";

// ---------- Projects ----------

export function subscribeProjects(cb: (projects: Project[]) => void) {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
  });
}

export async function createProject(
  name: string,
  description: string,
  createdBy: string,
  createdByName: string
) {
  await addDoc(collection(db, "projects"), {
    name,
    description,
    createdBy,
    createdByName,
    createdAt: Date.now(),
  });
}

export async function deleteProject(projectId: string) {
  await deleteDoc(doc(db, "projects", projectId));
}

// ---------- Tasks ----------

export function subscribeTasks(projectId: string, cb: (tasks: Task[]) => void) {
  const q = query(
    collection(db, "projects", projectId, "tasks"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
  });
}

export async function createTask(
  projectId: string,
  data: {
    name: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
    assigneeUid: string | null;
    assigneeName: string | null;
    createdBy: string;
  }
) {
  await addDoc(collection(db, "projects", projectId, "tasks"), {
    ...data,
    projectId,
    status: "todo" as TaskStatus,
    createdAt: Date.now(),
    completedAt: null,
  });
}

export async function updateTaskStatus(
  projectId: string,
  taskId: string,
  status: TaskStatus,
  actingUserUid: string
) {
  const taskRef = doc(db, "projects", projectId, "tasks", taskId);
  await updateDoc(taskRef, {
    status,
    completedAt: status === "done" ? Date.now() : null,
  });

  if (status === "done") {
    await bumpStreak(actingUserUid);
  }
}

export async function deleteTask(projectId: string, taskId: string) {
  await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
}

// ---------- Streaks / motivation ----------

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const dA = new Date(a + "T00:00:00");
  const dB = new Date(b + "T00:00:00");
  return Math.round((dB.getTime() - dA.getTime()) / 86400000);
}

async function bumpStreak(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const profile = snap.data() as UserProfile;
  const today = todayStr();

  if (profile.lastCompletedDate === today) {
    // already logged a completion today, just bump total
    await updateDoc(ref, { totalCompleted: increment(1) });
    return;
  }

  let newStreak = 1;
  if (profile.lastCompletedDate) {
    const gap = daysBetween(profile.lastCompletedDate, today);
    if (gap === 1) newStreak = profile.streak + 1;
  }

  await setDoc(
    ref,
    {
      streak: newStreak,
      lastCompletedDate: today,
      totalCompleted: increment(1),
    },
    { merge: true }
  );
}

export function subscribeLeaderboard(cb: (users: UserProfile[]) => void) {
  const q = query(collection(db, "users"), orderBy("totalCompleted", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as UserProfile));
  });
}

export function subscribeAllUsers(cb: (users: UserProfile[]) => void) {
  const q = query(collection(db, "users"), orderBy("displayName", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as UserProfile));
  });
}
