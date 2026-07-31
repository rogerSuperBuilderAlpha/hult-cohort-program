"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Attachment, MessageFlag, WorkspaceState } from "@/lib/types";
import { loadWorkspace, resetWorkspace, saveWorkspace } from "@/lib/storage";
import { applyDemoUserToWorkspace } from "@/lib/demo-user";
import {
  activeChannel,
  addGroupMembers,
  channelMessages,
  createGroupChat,
  memberById,
  postMessage,
  removeGroupMember,
  renameGroupChat,
  threadReplies,
  toggleMessageFlag,
} from "@/lib/workspace";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { MessagePane } from "@/components/MessagePane";
import { ThreadPanel } from "@/components/ThreadPanel";
import { StartGroupChatModal } from "@/components/StartGroupChatModal";
import { ManageGroupModal } from "@/components/ManageGroupModal";
import { AiChatbox } from "@/components/AiChatbox";

export function WorkspaceApp() {
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadDraft, setThreadDraft] = useState("");
  const [threadAttachments, setThreadAttachments] = useState<Attachment[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [startGroupOpen, setStartGroupOpen] = useState(false);
  const [manageGroupOpen, setManageGroupOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(applyDemoUserToWorkspace(loadWorkspace()));
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.channels.length === 0) {
      setState(applyDemoUserToWorkspace(resetWorkspace()));
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const result = saveWorkspace(state);
      if (!result.ok) {
        setSaveError(
          result.reason === "quota"
            ? "Browser storage is full. Remove large attachments or use Reset demo."
            : "Could not save the workspace in this browser."
        );
      } else {
        setSaveError(null);
      }
    }, 250);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const channel = useMemo(
    () => (state ? activeChannel(state) : null),
    [state]
  );
  const messages = useMemo(
    () => (state && channel ? channelMessages(state, channel.id) : []),
    [state, channel]
  );
  const threadParent = useMemo(
    () =>
      state && threadId
        ? (state.messages.find((m) => m.id === threadId) ?? null)
        : null,
    [state, threadId]
  );
  const replies = useMemo(
    () => (state && threadId ? threadReplies(state, threadId) : []),
    [state, threadId]
  );

  if (!state || !channel) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--ink-muted)]">
        Loading workspace…
      </div>
    );
  }

  const currentUser = memberById(state, state.currentUserId);

  function selectChannel(id: string) {
    setState((prev) =>
      prev
        ? {
            ...prev,
            activeChannelId: id,
            channels: prev.channels.map((c) =>
              c.id === id ? { ...c, unread: 0 } : c
            ),
          }
        : prev
    );
    setThreadId(null);
    setThreadAttachments([]);
    setManageGroupOpen(false);
    setMobileNavOpen(false);
  }

  function send() {
    setState((prev) =>
      prev ? postMessage(prev, draft, { attachments }) : prev
    );
    setDraft("");
    setAttachments([]);
  }

  function sendThread() {
    if (!threadId) return;
    setState((prev) =>
      prev
        ? postMessage(prev, threadDraft, {
            threadParentId: threadId,
            attachments: threadAttachments,
          })
        : prev
    );
    setThreadDraft("");
    setThreadAttachments([]);
  }

  function handleToggleFlag(messageId: string, flag: MessageFlag) {
    setState((prev) =>
      prev ? toggleMessageFlag(prev, messageId, flag) : prev
    );
  }

  function handleReset() {
    setSaveError(null);
    setState(applyDemoUserToWorkspace(resetWorkspace()));
    setThreadId(null);
    setDraft("");
    setAttachments([]);
    setThreadDraft("");
    setThreadAttachments([]);
    setStartGroupOpen(false);
    setManageGroupOpen(false);
  }

  function handleCreateGroup(name: string, memberIds: string[]) {
    setState((prev) => (prev ? createGroupChat(prev, name, memberIds) : prev));
    setStartGroupOpen(false);
    setMobileNavOpen(false);
    setThreadId(null);
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col p-3 sm:p-4 lg:p-5">
      {saveError && (
        <div
          role="alert"
          className="mb-3 border-[1.5px] border-[var(--line)] bg-[var(--warm-soft)] px-4 py-3 font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[var(--ink)] shadow-[var(--shadow-sm)]"
        >
          {saveError}
        </div>
      )}
      <div className="forth-panel flex min-h-[calc(100vh-1.5rem)] flex-1 overflow-hidden sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)]">
        <WorkspaceSidebar
          state={state}
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          onSelectChannel={selectChannel}
          onReset={handleReset}
          onStartGroupChat={() => {
            setStartGroupOpen(true);
            setMobileNavOpen(false);
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <MessagePane
            channel={channel}
            messages={messages}
            state={state}
            draft={draft}
            attachments={attachments}
            currentUserName={currentUser?.name ?? "You"}
            onDraftChange={setDraft}
            onAttachmentsChange={setAttachments}
            onSend={send}
            onOpenThread={(id) => {
              setThreadId(id);
              setThreadAttachments([]);
            }}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onManageGroup={() => setManageGroupOpen(true)}
            onToggleFlag={handleToggleFlag}
            onOpenAi={() => setAiOpen(true)}
            aiOpen={aiOpen}
          />
        </div>

        {threadParent && (
          <ThreadPanel
            parent={threadParent}
            replies={replies}
            state={state}
            draft={threadDraft}
            attachments={threadAttachments}
            onDraftChange={setThreadDraft}
            onAttachmentsChange={setThreadAttachments}
            onSend={sendThread}
            onClose={() => {
              setThreadId(null);
              setThreadAttachments([]);
            }}
            onToggleFlag={handleToggleFlag}
          />
        )}
      </div>

      <AiChatbox
        state={state}
        open={aiOpen}
        onClose={() => setAiOpen(false)}
      />

      {startGroupOpen && (
        <StartGroupChatModal
          state={state}
          onClose={() => setStartGroupOpen(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {manageGroupOpen && channel.kind === "group" && (
        <ManageGroupModal
          state={state}
          channel={channel}
          onClose={() => setManageGroupOpen(false)}
          onRename={(name) =>
            setState((prev) =>
              prev ? renameGroupChat(prev, channel.id, name) : prev
            )
          }
          onAddMembers={(ids) =>
            setState((prev) =>
              prev ? addGroupMembers(prev, channel.id, ids) : prev
            )
          }
          onRemoveMember={(memberId) =>
            setState((prev) =>
              prev ? removeGroupMember(prev, channel.id, memberId) : prev
            )
          }
        />
      )}
    </div>
  );
}
