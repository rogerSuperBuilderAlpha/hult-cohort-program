"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SidebarPageFrame, {
  SidebarPanelCompact,
  SidebarSectionTitle,
  sidebarHintClassName,
  sidebarLabelClassName,
  sidebarSelectClassName,
} from "@/components/sidebar/SidebarPageFrame";
import { useSidebarData } from "@/hooks/SidebarDataProvider";
import type { FlatTask } from "@/lib/sidebarStats";
import {
  getMotivationalMessages,
  getMotivationMessageType,
  getTaskDisplayName,
  insertTextAtPosition,
  isTaskComplete,
  MOTIVATION_EMOJIS,
} from "@/lib/motivationMessages";
import { formatMotivationLogTimestamp } from "@/lib/motivationLog";
import { useMotivationLog } from "@/hooks/useMotivationLog";
import { dashboardPrimaryButtonClassName } from "@/lib/dashboardStyles";

const messageTextareaClassName =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs leading-snug text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const emojiButtonClassName =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-base transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:hover:bg-surface-card";

interface TextSelection {
  start: number;
  end: number;
}

function sortMemberTasks(tasks: FlatTask[]): FlatTask[] {
  return [...tasks].sort((left, right) => {
    const leftDone = isTaskComplete(left) ? 1 : 0;
    const rightDone = isTaskComplete(right) ? 1 : 0;

    if (leftDone !== rightDone) {
      return leftDone - rightDone;
    }

    return getTaskDisplayName(left).localeCompare(getTaskDisplayName(right));
  });
}

function getStatusLabel(task: FlatTask): string {
  return task.status.trim() || "Unset";
}

export default function MotivateAFriendPage() {
  return (
    <SidebarPageFrame
      title="Motivate A Friend"
      subtitle="Select a Team Member and Task, Then Send a Motivational Message"
    >
      <MotivateAFriendContent />
    </SidebarPageFrame>
  );
}

function MotivateAFriendContent() {
  const { members, getMemberTasks } = useSidebarData();
  const { entries: sentMessages, logMessage } = useMotivationLog();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const messageSelectionRef = useRef<TextSelection>({ start: 0, end: 0 });

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? members[0],
    [members, selectedMemberId]
  );

  const memberTasks = useMemo(
    () => (selectedMember ? sortMemberTasks(getMemberTasks(selectedMember.name)) : []),
    [getMemberTasks, selectedMember]
  );

  const selectedTask = useMemo(
    () => memberTasks.find((task) => task.id === selectedTaskId) ?? null,
    [memberTasks, selectedTaskId]
  );

  const suggestedMessages = useMemo(
    () => (selectedTask ? getMotivationalMessages(selectedTask) : []),
    [selectedTask]
  );

  const selectedSuggestionIndex = useMemo(
    () => suggestedMessages.findIndex((message) => message === messageText),
    [messageText, suggestedMessages]
  );

  const finalMessage = messageText.trim();

  const saveMessageSelection = () => {
    const textarea = messageTextareaRef.current;
    if (!textarea) {
      return;
    }

    messageSelectionRef.current = {
      start: textarea.selectionStart ?? messageText.length,
      end: textarea.selectionEnd ?? messageText.length,
    };
  };

  const applyMessageText = (nextValue: string, cursor?: number) => {
    setMessageText(nextValue);

    requestAnimationFrame(() => {
      const textarea = messageTextareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      const position = cursor ?? nextValue.length;
      textarea.setSelectionRange(position, position);
      messageSelectionRef.current = { start: position, end: position };
    });
  };

  const handleEmojiInsert = (emoji: string) => {
    const { start, end } = messageSelectionRef.current;
    const { nextValue, cursor } = insertTextAtPosition(messageText, emoji, start, end);
    applyMessageText(nextValue, cursor);
  };

  useEffect(() => {
    setSelectedTaskId("");
    setMessageText("");
    setEmailError(null);
    messageSelectionRef.current = { start: 0, end: 0 };
  }, [selectedMember?.id]);

  useEffect(() => {
    const defaultMessage = suggestedMessages[0] ?? "";
    setMessageText(defaultMessage);
    setEmailError(null);
    messageSelectionRef.current = {
      start: defaultMessage.length,
      end: defaultMessage.length,
    };
  }, [selectedTaskId, suggestedMessages]);

  const handleEmailMessage = () => {
    setEmailError(null);

    if (!selectedMember) {
      return;
    }

    if (!selectedTask) {
      setEmailError("Select a task before sending a message.");
      return;
    }

    if (!finalMessage) {
      setEmailError("Choose a suggested message or enter a custom message.");
      return;
    }

    const recipientEmail = selectedMember.email.trim();
    if (!recipientEmail) {
      setEmailError("Add an email for this member on the Team Members page.");
      return;
    }

    const taskLabel = getTaskDisplayName(selectedTask);
    const subject = encodeURIComponent(`Message from your team — ${taskLabel}`);
    const body = encodeURIComponent(finalMessage);

    logMessage({
      memberName: selectedMember.name,
      messageType: getMotivationMessageType(selectedTask),
      message: finalMessage,
      taskName: taskLabel,
    });

    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {members.length === 0 ? (
        <SidebarPanelCompact>
          <p className="text-xs text-slate-600 dark:text-surface-secondary">
            No team members yet. Add names from{" "}
            <Link
              href="/team-members"
              className="font-medium text-amber-900 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Team Members
            </Link>{" "}
            in the Command Center, then return here to motivate them.
          </p>
        </SidebarPanelCompact>
      ) : (
        <>
        <div className="grid gap-3 lg:grid-cols-2">
          <SidebarPanelCompact className="space-y-3">
            <div>
              <label htmlFor="motivate-member" className={sidebarLabelClassName}>
                Select Team Member
              </label>
              <select
                id="motivate-member"
                value={selectedMember?.id ?? ""}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                className={sidebarSelectClassName}
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="motivate-task" className={sidebarLabelClassName}>
                Select a Task
              </label>
              <select
                id="motivate-task"
                value={selectedTaskId}
                onChange={(event) => setSelectedTaskId(event.target.value)}
                className={sidebarSelectClassName}
                disabled={memberTasks.length === 0}
              >
                <option value="">
                  {memberTasks.length === 0 ? "No assigned tasks" : "Choose a task"}
                </option>
                {memberTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {getTaskDisplayName(task)} — {task.initiativeTitle} ({getStatusLabel(task)})
                  </option>
                ))}
              </select>
            </div>

            {selectedTask && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
                <SidebarSectionTitle>
                  Message — {isTaskComplete(selectedTask) ? "Congratulatory" : "Motivational"}
                </SidebarSectionTitle>
                <p className={`mt-1 ${sidebarHintClassName}`}>
                  Popular messages for{" "}
                  <span className="font-medium text-slate-700 dark:text-surface-primary">
                    {getTaskDisplayName(selectedTask)}
                  </span>
                </p>

                <fieldset className="mt-2 space-y-1.5">
                  <legend className="sr-only">Suggested messages</legend>
                  {suggestedMessages.map((message, index) => (
                    <label
                      key={message}
                      className="flex cursor-pointer items-start gap-2 rounded-md border border-transparent px-1 py-0.5 hover:border-amber-200 dark:hover:border-amber-500/30"
                    >
                      <input
                        type="radio"
                        name="motivation-message"
                        checked={selectedSuggestionIndex === index}
                        onChange={() => applyMessageText(message, message.length)}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="text-xs leading-snug text-slate-800 dark:text-surface-primary">
                        {message}
                      </span>
                    </label>
                  ))}
                </fieldset>

                <div className="mt-3">
                  <label htmlFor="motivate-message" className={sidebarLabelClassName}>
                    Message
                  </label>
                  <p className={`mt-0.5 ${sidebarHintClassName}`}>
                    Click in the message to place your cursor, then add one or more emojis.
                  </p>
                  <textarea
                    ref={messageTextareaRef}
                    id="motivate-message"
                    rows={4}
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onSelect={saveMessageSelection}
                    onClick={saveMessageSelection}
                    onKeyUp={saveMessageSelection}
                    onFocus={saveMessageSelection}
                    onBlur={saveMessageSelection}
                    placeholder="Choose a suggestion above or write your own note..."
                    className={messageTextareaClassName}
                  />
                </div>

                <div className="mt-3">
                  <p className={sidebarLabelClassName}>Insert Emoji</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {MOTIVATION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleEmojiInsert(emoji)}
                        className={emojiButtonClassName}
                        aria-label={`Insert ${emoji} at cursor`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEmailMessage}
                  disabled={!finalMessage}
                  className={`${dashboardPrimaryButtonClassName} mt-3 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Email Message
                </button>

                {emailError && (
                  <p role="alert" className="mt-2 text-[11px] text-red-700 dark:text-red-400">
                    {emailError}
                  </p>
                )}

                {selectedMember && !selectedMember.email.trim() && (
                  <p className={`mt-2 ${sidebarHintClassName}`}>
                    Add {selectedMember.name}&apos;s email on the Team Members page to enable Email
                    Message.
                  </p>
                )}
              </div>
            )}
          </SidebarPanelCompact>

          {selectedMember && (
            <SidebarPanelCompact>
              <SidebarSectionTitle>{selectedMember.name}&apos;s Tasks</SidebarSectionTitle>
              {memberTasks.length === 0 ? (
                <p className={`mt-2 ${sidebarHintClassName}`}>
                  No tasks assigned to {selectedMember.name} yet.
                </p>
              ) : (
                <ul className="mt-2 grid gap-1.5">
                  {memberTasks.map((task) => {
                    const isSelected = task.id === selectedTaskId;
                    const complete = isTaskComplete(task);
                    const statusLabel = getStatusLabel(task);

                    return (
                      <li key={task.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`w-full rounded-md border px-2 py-1.5 text-left text-xs leading-snug transition-colors ${
                            isSelected
                              ? "border-brand-400 bg-brand-50 ring-1 ring-brand-300 dark:border-brand-500/50 dark:bg-brand-500/10 dark:ring-brand-500/30"
                              : "border-slate-200 hover:bg-slate-50 dark:border-surface-border dark:hover:bg-surface-bg"
                          }`}
                        >
                          <span className="font-medium text-slate-900 dark:text-surface-primary">
                            {getTaskDisplayName(task)}
                          </span>
                          <span className="text-slate-500 dark:text-surface-secondary">
                            {" "}
                            — {task.initiativeTitle}
                          </span>
                          <span
                            className={`ml-1 font-semibold ${
                              complete
                                ? "text-emerald-700 dark:text-emerald-400"
                                : statusLabel === "In Progress"
                                  ? "text-brand-700 dark:text-brand-400"
                                  : "text-slate-600 dark:text-surface-secondary"
                            }`}
                          >
                            ({statusLabel})
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SidebarPanelCompact>
          )}
        </div>

        <SidebarPanelCompact className="mt-3">
          <SidebarSectionTitle>Sent Messages</SidebarSectionTitle>
          <p className={`mt-1 ${sidebarHintClassName}`}>
            A running log of motivational messages you send from this page. Saved on this device
            only — not synced to Supabase or other browsers.
          </p>

          {sentMessages.length === 0 ? (
            <p className={`mt-2 ${sidebarHintClassName}`}>
              No messages sent yet. Use Email Message to send your first note.
            </p>
          ) : (
            <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {sentMessages.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-surface-border"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-medium text-slate-900 dark:text-surface-primary">
                      {entry.memberName}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        entry.messageType === "Congratulatory"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                      }`}
                    >
                      {entry.messageType}
                    </span>
                    {entry.taskName && (
                      <span className="text-[11px] text-slate-500 dark:text-surface-secondary">
                        {entry.taskName}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] tabular-nums text-slate-500 dark:text-surface-secondary">
                      {formatMotivationLogTimestamp(entry.sentAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-700 dark:text-surface-secondary">
                    {entry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SidebarPanelCompact>
        </>
      )}
    </>
  );
}
