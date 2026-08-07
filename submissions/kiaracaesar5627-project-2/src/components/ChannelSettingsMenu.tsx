"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  archiveChannelAction,
  renameChannelAction,
} from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function ChannelSettingsMenu({
  channelId,
  channelName,
}: {
  channelId: string;
  channelName: string;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setRenaming(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setRenaming(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setRenaming(false);
  }

  return (
    <div className="channel-settings" ref={rootRef}>
      <button
        type="button"
        className="channel-settings-trigger"
        aria-label="Channel settings"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((prev) => !prev);
          setRenaming(false);
        }}
      >
        ⋯
      </button>

      {open ? (
        <div
          id={menuId}
          className="channel-settings-menu"
          role="menu"
          aria-label="Channel settings"
        >
          {renaming ? (
            <form
              className="channel-settings-rename"
              action={renameChannelAction}
              onSubmit={closeMenu}
            >
              <input type="hidden" name="channelId" value={channelId} />
              <label>
                Channel name
                <input
                  name="name"
                  defaultValue={channelName}
                  required
                  autoFocus
                  maxLength={80}
                />
              </label>
              <div className="channel-settings-rename-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setRenaming(false)}
                >
                  Back
                </button>
                <SubmitButton className="btn-secondary">Save</SubmitButton>
              </div>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="channel-settings-item"
                role="menuitem"
                onClick={() => setRenaming(true)}
              >
                Rename channel
              </button>
              <form action={archiveChannelAction}>
                <input type="hidden" name="channelId" value={channelId} />
                <input type="hidden" name="archived" value="true" />
                <button
                  type="submit"
                  className="channel-settings-item channel-settings-danger"
                  role="menuitem"
                >
                  Archive channel
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
