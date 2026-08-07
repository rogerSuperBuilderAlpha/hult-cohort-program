"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { moveTaskAction } from "@/lib/actions";
import { readableText } from "@/lib/labels";
import type { Label, Status } from "@/lib/types";

type KanbanTask = {
  id: string;
  title: string;
  status_id: string | null;
  assignee?: { username: string } | null;
  labels?: Label[];
};

export function KanbanBoard({
  workspaceId,
  statuses,
  tasks,
}: {
  workspaceId: string;
  statuses: Status[];
  tasks: KanbanTask[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  // Optimistic local status mapping.
  const [local, setLocal] = useState<Record<string, string | null>>({});

  const statusOf = (t: KanbanTask) => local[t.id] ?? t.status_id;

  function move(taskId: string, statusId: string) {
    setLocal((m) => ({ ...m, [taskId]: statusId }));
    const fd = new FormData();
    fd.set("taskId", taskId);
    fd.set("statusId", statusId);
    fd.set("position", "0");
    startTransition(async () => {
      await moveTaskAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="kanban">
      {statuses.map((status) => {
        const colTasks = tasks.filter((t) => statusOf(t) === status.id);
        return (
          <div
            key={status.id}
            className={`kanban-col${overCol === status.id ? " drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === status.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              setOverCol(null);
              if (dragId) move(dragId, status.id);
              setDragId(null);
            }}
          >
            <div className="kanban-col-head">
              <span className="split">
                <span className="dot" style={{ background: status.color }} aria-hidden />
                {status.name}
              </span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            {colTasks.map((t) => (
              <div
                key={t.id}
                className={`kanban-card${dragId === t.id ? " dragging" : ""}`}
                draggable
                onDragStart={() => setDragId(t.id)}
                onDragEnd={() => setDragId(null)}
              >
                <strong>{t.title}</strong>
                {t.labels && t.labels.length > 0 ? (
                  <div className="chip-row">
                    {t.labels.map((l) => (
                      <span
                        key={l.id}
                        className="badge"
                        style={{
                          background: l.color,
                          color: readableText(l.color),
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="row-split">
                  <span className="muted" style={{ fontSize: "0.78rem" }}>
                    {t.assignee ? `@${t.assignee.username}` : "unassigned"}
                  </span>
                  <Link
                    href={`/w/${workspaceId}/tasks/${t.id}`}
                    className="muted"
                    style={{ fontSize: "0.78rem", fontWeight: 700 }}
                  >
                    Open →
                  </Link>
                </div>
              </div>
            ))}
            {colTasks.length === 0 ? (
              <span className="muted" style={{ fontSize: "0.8rem" }}>
                Drop tasks here
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
